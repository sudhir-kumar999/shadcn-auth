import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    // 1️⃣ client se data lo
    const { name, email, password } = await req.json();

    // 2️⃣ supabase server client (SSR)
    const supabase = await createSupabaseServerClient();

    // 3️⃣ auth signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { message: error?.message || "Signup failed" },
        { status: 400 }
      );
    }

    // 4️⃣ profile table insert (🔥 MOST IMPORTANT PART)
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        name,
        email,
      });

    if (profileError) {
      return NextResponse.json(
        { message: profileError.message },
        { status: 400 }
      );
    }

    // 5️⃣ success response
    return NextResponse.json({
      message: "Signup successful",
      user: data.user,
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
