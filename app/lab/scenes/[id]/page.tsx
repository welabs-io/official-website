// LAB DE UMA CENA DO KIT
// /lab/scenes/<id>: one kit scene alone on the cream floor, to build and approve it in isolation before it is mounted
// in the site. Never indexed.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import shell from "@/components/onepage/shell.module.css";
import { LabStage } from "@/components/scene-kit/LabStage";
import { isSceneId, SCENE_IDS } from "@/components/scene-kit/registry";
import k from "@/components/scene-kit/lab.module.css";

export const metadata: Metadata = {
  title: "Lab de cenas",
  robots: { index: false, follow: false },
};

export const generateStaticParams = () => SCENE_IDS.map((id) => ({ id }));
export const dynamicParams = false;

export default async function SceneLabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSceneId(id)) notFound();
  return (
    <div className={`${shell.page} ${k.main}`}>
      <LabStage id={id} />
    </div>
  );
}
