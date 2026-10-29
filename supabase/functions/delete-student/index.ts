import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface DeleteStudentBody {
  student_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    const authorization =
      req.headers.get('Authorization');

    if (!authorization) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authorization tidak ditemukan.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const accessToken =
      authorization.replace('Bearer ', '');

    const supabaseUrl =
      Deno.env.get('SUPABASE_URL');

    const supabaseAnonKey =
      Deno.env.get('SUPABASE_ANON_KEY');

    const supabaseServiceRoleKey =
      Deno.env.get(
        'SUPABASE_SERVICE_ROLE_KEY'
      );

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseServiceRoleKey
    ) {
      throw new Error(
        'Environment variable Supabase belum lengkap.'
      );
    }

    const supabaseUser =
      createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          global: {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        }
      );

    const {
      data: { user: teacher },
      error: teacherError,
    } =
      await supabaseUser.auth.getUser();

    if (teacherError || !teacher) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Session guru tidak valid.',
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseAdmin =
      createClient(
        supabaseUrl,
        supabaseServiceRoleKey
      );

    const body =
      (await req.json()) as DeleteStudentBody;

    const studentId =
      body.student_id;

    if (!studentId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID siswa wajib diisi.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const {
      data: student,
      error: studentError,
    } =
      await supabaseAdmin
        .from('profiles')
        .select(
          'id, full_name, role, created_by'
        )
        .eq('id', studentId)
        .eq('role', 'student')
        .eq('created_by', teacher.id)
        .maybeSingle();

    if (studentError) {
      throw studentError;
    }

    if (!student) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'Siswa tidak ditemukan atau bukan siswa dari guru ini.',
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const {
      error: deleteAuthError,
    } =
      await supabaseAdmin.auth.admin.deleteUser(
        studentId
      );

    if (deleteAuthError) {
      throw deleteAuthError;
    }

    const {
      error: deleteProfileError,
    } =
      await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', studentId)
        .eq('created_by', teacher.id);

    if (deleteProfileError) {
      throw deleteProfileError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Siswa berhasil dihapus.',
        student_id: studentId,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error(
      'Delete student error:',
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Gagal menghapus siswa.',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});