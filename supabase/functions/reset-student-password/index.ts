import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

function generateTemporaryPassword(length = 10) {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = "";

  for (let i = 0; i < length; i++) {
    password += characters[randomValues[i] % characters.length];
  }

  return password;
}

Deno.serve(async (req: Request) => {
  /**
   * =========================================================
   * CORS
   * =========================================================
   */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    /**
     * =========================================================
     * ENVIRONMENT VARIABLES
     * =========================================================
     */

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get(
      "SUPABASE_SERVICE_ROLE_KEY"
    );

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseServiceRoleKey
    ) {
      throw new Error(
        "Supabase environment variables belum lengkap."
      );
    }

    /**
     * =========================================================
     * AUTHORIZATION HEADER
     * =========================================================
     */

    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authorization header tidak ditemukan.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * CLIENT UNTUK MEMVERIFIKASI TEACHER
     * =========================================================
     */

    const userClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const {
      data: {
        user,
      },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Sesi login tidak valid.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * ADMIN CLIENT
     *
     * Service Role Key hanya digunakan di Edge Function.
     * JANGAN pernah memasukkan key ini ke Expo app.
     * =========================================================
     */

    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /**
     * =========================================================
     * CEK PROFILE TEACHER
     * =========================================================
     */

    const {
      data: teacherProfile,
      error: teacherProfileError,
    } = await adminClient
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (teacherProfileError) {
      console.error(
        "Teacher profile error:",
        teacherProfileError
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Gagal memeriksa akun teacher.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!teacherProfile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Profile teacher tidak ditemukan.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (teacherProfile.role !== "teacher") {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Akses ditolak. Hanya teacher yang dapat mereset password siswa.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * BACA REQUEST BODY
     * =========================================================
     */

    const body = await req.json();

    const studentId = body?.student_id;

    if (!studentId || typeof studentId !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "student_id wajib dikirim.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * CEK SISWA
     *
     * Teacher hanya boleh reset password siswa
     * yang memang dibuat oleh teacher tersebut.
     * =========================================================
     */

    const {
      data: studentProfile,
      error: studentProfileError,
    } = await adminClient
      .from("profiles")
      .select(
        `
        id,
        full_name,
        username,
        role,
        grade,
        class_name,
        created_by,
        must_change_password
        `
      )
      .eq("id", studentId)
      .maybeSingle();

    if (studentProfileError) {
      console.error(
        "Student profile error:",
        studentProfileError
      );

      return new Response(
        JSON.stringify({
          success: false,
          error: "Gagal mencari data siswa.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!studentProfile) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Siswa tidak ditemukan.",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * VALIDASI ROLE SISWA
     * =========================================================
     */

    if (studentProfile.role !== "student") {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Akun yang dipilih bukan akun siswa.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * VALIDASI KEPEMILIKAN SISWA
     *
     * Teacher A tidak boleh mereset siswa milik Teacher B.
     * =========================================================
     */

    if (studentProfile.created_by !== user.id) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Anda tidak memiliki akses untuk mereset password siswa ini.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * GENERATE PASSWORD BARU
     * =========================================================
     */

    const temporaryPassword =
      generateTemporaryPassword(10);

    /**
     * =========================================================
     * UPDATE PASSWORD SUPABASE AUTH
     * =========================================================
     */

    const {
      error: updatePasswordError,
    } = await adminClient.auth.admin.updateUserById(
      studentProfile.id,
      {
        password: temporaryPassword,
      }
    );

    if (updatePasswordError) {
      console.error(
        "Update password error:",
        updatePasswordError
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Gagal mengubah password siswa.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * UPDATE PROFILE
     *
     * Siswa diwajibkan mengganti password
     * setelah menggunakan password sementara.
     * =========================================================
     */

    const {
      error: updateProfileError,
    } = await adminClient
      .from("profiles")
      .update({
        must_change_password: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", studentProfile.id);

    if (updateProfileError) {
      console.error(
        "Update profile error:",
        updateProfileError
      );

      /**
       * Password Auth sudah berubah.
       *
       * Kita tetap mengembalikan password baru
       * karena password tersebut memang sudah aktif.
       */
      return new Response(
        JSON.stringify({
          success: true,
          warning:
            "Password berhasil diubah, tetapi status must_change_password gagal diperbarui.",
          student: {
            id: studentProfile.id,
            full_name: studentProfile.full_name,
            username: studentProfile.username,
            grade: studentProfile.grade,
            class_name: studentProfile.class_name,
          },
          temporary_password: temporaryPassword,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * SUCCESS
     * =========================================================
     */

    return new Response(
      JSON.stringify({
        success: true,

        message:
          "Password siswa berhasil di-reset.",

        student: {
          id: studentProfile.id,
          full_name: studentProfile.full_name,
          username: studentProfile.username,
          grade: studentProfile.grade,
          class_name: studentProfile.class_name,
        },

        temporary_password:
          temporaryPassword,

        must_change_password: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan pada server.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});