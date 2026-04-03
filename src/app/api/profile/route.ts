import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  let profile = await prisma.businessProfile.findUnique({
    where: { id: 1 },
    include: {
      colors: true,
      shapes: true,
      lengths: true,
    },
  });

  if (!profile) {
    profile = await prisma.businessProfile.create({
      data: {
        id: 1,
        businessName: "Nail Studio",
        ownerName: "",
        tones: "cute, classy, modern",
        colors: {
          create: [
            { name: "Pink", hex: "#f8b4c6" },
            { name: "White", hex: "#ffffff" },
            { name: "Nude", hex: "#d6b59a" },
          ],
        },
        shapes: {
          create: [{ name: "Almond" }, { name: "Square" }, { name: "Coffin" }],
        },
        lengths: {
          create: [{ name: "Short" }, { name: "Medium" }, { name: "Long" }],
        },
      },
      include: {
        colors: true,
        shapes: true,
        lengths: true,
      },
    });
  }

  return NextResponse.json(profile);
}

export async function POST(req: Request) {
  const body = await req.json();

  const {
    businessName,
    ownerName,
    tones,
    colors = [],
    shapes = [],
    lengths = [],
  } = body;

  await prisma.nailColor.deleteMany({ where: { profileId: 1 } });
  await prisma.nailShape.deleteMany({ where: { profileId: 1 } });
  await prisma.nailLength.deleteMany({ where: { profileId: 1 } });

  const profile = await prisma.businessProfile.upsert({
    where: { id: 1 },
    update: {
      businessName,
      ownerName,
      tones,
      colors: {
        create: colors.map((c: { name: string; hex?: string }) => ({
          name: c.name,
          hex: c.hex || null,
        })),
      },
      shapes: {
        create: shapes.map((s: string) => ({ name: s })),
      },
      lengths: {
        create: lengths.map((l: string) => ({ name: l })),
      },
    },
    create: {
      id: 1,
      businessName,
      ownerName,
      tones,
      colors: {
        create: colors.map((c: { name: string; hex?: string }) => ({
          name: c.name,
          hex: c.hex || null,
        })),
      },
      shapes: {
        create: shapes.map((s: string) => ({ name: s })),
      },
      lengths: {
        create: lengths.map((l: string) => ({ name: l })),
      },
    },
    include: {
      colors: true,
      shapes: true,
      lengths: true,
    },
  });

  return NextResponse.json(profile);
}