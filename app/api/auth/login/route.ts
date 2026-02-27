import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // ================= FIND USER =================
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // ================= CHECK PASSWORD =================
    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      )
    }

    // ================= SUCCESS RESPONSE =================
    const response = NextResponse.json(
      {
        message: "Login successful",
        role: user.role
      },
      { status: 200 }
    )

    // ✅ SESSION COOKIE (SERVER ONLY - SECURITY)
    response.cookies.set("session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    // ✅ ROLE COOKIE (CLIENT CAN READ → SIDEBAR)
    response.cookies.set("role", user.role, {
      httpOnly: false, // ⭐ VERY IMPORTANT
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response

  } catch (error) {
    console.error("Login error:", error)

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    )
  }
}