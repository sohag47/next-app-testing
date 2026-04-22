type LoginRequest = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginRequest | null;
  const email = body?.email?.trim();
  const password = body?.password;

  if (!email || !password) {
    return Response.json(
      { message: "Email and password are required." },
      { status: 400 },
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 900));

  if (email === "demo@example.com" && password === "password123") {
    return Response.json({
      message: "Login Successfully",
      data: {
        id: 1,
        name: "Demo",
        email: "demo@example.com",
        token: "sdfghjk",
      },
    });
  }

  return Response.json(
    {
      message: "Invalid fake credentials. Try demo@example.com / password123.",
    },
    { status: 401 },
  );
}
