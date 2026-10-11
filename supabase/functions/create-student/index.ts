import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
};

function generateUsername(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 20);

  const randomNumber = Math.floor(
    1000 + Math.random() * 9000
  );

  return `${base}_${randomNumber}`;
}

function generateTemporaryPassword(length = 10) {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  let password = "";

  for (let i = 0; i < length; i++) {
    password +=
      characters[randomValues[i] % characters.length];
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

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey =
      Deno.env.get("SUPABASE_ANON_KEY");

    const supabaseServiceRoleKey =
      Deno.env.get(
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
     * AUTHORIZATION
     * =========================================================
     */

    const authHeader =
      req.headers.get("Authorization");

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Authorization header tidak ditemukan.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * USER CLIENT
     *
     * Digunakan untuk mengetahui siapa teacher
     * yang sedang login.
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
    } =
      await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Sesi login tidak valid.",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * ADMIN CLIENT
     *
     * Service Role hanya berada di server.
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
    } =
      await adminClient
        .from("profiles")
        .select(
          "id, full_name, role"
        )
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
          error:
            "Gagal memeriksa profile teacher.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    if (!teacherProfile) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Profile teacher tidak ditemukan.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    if (
      teacherProfile.role !== "teacher"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Hanya teacher yang dapat membuat akun siswa.",
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * REQUEST BODY
     * =========================================================
     */

    const body = await req.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const grade = Number(body?.grade);

    const className =
      typeof body?.class_name === "string"
        ? body.class_name.trim().toUpperCase()
        : "";

    /**
     * =========================================================
     * VALIDASI NAMA
     * =========================================================
     */

    if (!name) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Nama siswa wajib diisi.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    if (name.length < 2) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Nama siswa terlalu pendek.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * VALIDASI GRADE
     * =========================================================
     */

    if (
      !Number.isInteger(grade) ||
      grade < 1 ||
      grade > 6
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Grade harus berada antara 1 sampai 6.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * VALIDASI CLASS
     * =========================================================
     */

    const validClasses = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
    ];

    if (
      !validClasses.includes(className)
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Kelas harus berupa A, B, C, D, E, atau F.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    /**
     * =========================================================
     * GENERATE USERNAME
     * =========================================================
     */

    let username =
      generateUsername(name);

    /**
     * Pastikan username belum digunakan.
     */

    for (let attempt = 0; attempt < 10; attempt++) {
      const {
        data: existingUsername,
      } = await adminClient
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (!existingUsername) {
        break;
      }

      username =
        generateUsername(name);
    }

    /**
     * =========================================================
     * INTERNAL EMAIL
     *
     * Siswa tidak perlu mengetahui email ini.
     * =========================================================
     */

    const internalEmail =
      `${username}@student.savanaquest.local`;

    /**
     * =========================================================
     * GENERATE PASSWORD
     * =========================================================
     */

    const temporaryPassword =
      generateTemporaryPassword(10);

    /**
     * =========================================================
     * CREATE AUTH USER
     * =========================================================
     */

    const {
      data: authData,
      error: authError,
    } =
      await adminClient.auth.admin.createUser(
        {
          email: internalEmail,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            username,
            role: "student",
          },
        }
      );

    if (
      authError ||
      !authData.user
    ) {
      console.error(
        "Create auth user error:",
        authError
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            authError?.message ||
            "Gagal membuat akun siswa.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    const studentId =
      authData.user.id;

    /**
     * =========================================================
     * CREATE PROFILE
     * =========================================================
     */

    const {
      error: profileError,
    } =
      await adminClient
        .from("profiles")
        .insert({
          id: studentId,
          full_name: name,
          username,
          role: "student",
          grade,
          class_name: className,
          must_change_password: true,
          created_by: user.id,
        });

    /**
     * =========================================================
     * ROLLBACK
     *
     * Jika profile gagal dibuat,
     * hapus user Auth yang sudah dibuat.
     * =========================================================
     */

    if (profileError) {
      console.error(
        "Create profile error:",
        profileError
      );

      await adminClient.auth.admin.deleteUser(
        studentId
      );

      return new Response(
        JSON.stringify({
          success: false,
          error:
            profileError.message ||
            "Gagal membuat profile siswa.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
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
          "Akun siswa berhasil dibuat.",

        student: {
          id: studentId,
          full_name: name,
          username,
          grade,
          class_name: className,
        },

        temporary_password:
          temporaryPassword,

        must_change_password: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
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
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});