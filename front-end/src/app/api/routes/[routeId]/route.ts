import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  request: NextRequest,
  { params }: { params: { routeId: string } }
) => {
  const id = params.routeId;
  const response = await fetch(`http://10.0.0.248:3000/routes/${id}`, {
    next: {
      revalidate: 1,
    },
  });
  
  return NextResponse.json(await response.json());
}