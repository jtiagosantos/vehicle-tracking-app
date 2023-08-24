import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const GET = async () => {
  const response = await fetch(`http://10.0.0.248:3000/routes`, {
    next: {
      revalidate: 1,
      tags: ["routes"],
    },
  });

  return NextResponse.json(await response.json());
}

export const POST = async (request: Request) => {
  const response = await fetch(`http://10.0.0.248:3000/routes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(await request.json()),
  });

  revalidateTag("routes");

  return NextResponse.json(await response.json());
}