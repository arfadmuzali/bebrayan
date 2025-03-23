import prisma from "@/lib/db";

async function getProfile(id: string) {
  try {
    const profile = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return profile;
  } catch {
    return null;
  }
}

export default async function Profile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const profile = await getProfile(id);

  return (
    <div className="mx-auto max-w-screen-2xl px-0 md:px-12 lg:px-16"></div>
  );
}
