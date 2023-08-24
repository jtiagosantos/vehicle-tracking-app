import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const url = new URL(request.url);
  const text = url.searchParams.get('text');
  const response = await fetch(`http://10.0.0.248:3000/places?text=${text}`, {
    next: {
      revalidate: 1,
    }
  });

  return NextResponse.json(await response.json());
}