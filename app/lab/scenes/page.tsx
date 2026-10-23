// ÍNDICE DO LAB DE CENAS
// /lab/scenes: the list of the kit scenes, each a link to its own lab page. Never indexed.
import type { Metadata } from "next";
import Link from "next/link";
import shell from "@/components/onepage/shell.module.css";
import { SCENE_IDS } from "@/components/scene-kit/registry";
import k from "@/components/scene-kit/lab.module.css";

export const metadata: Metadata = {
  title: "Lab de cenas",
  robots: { index: false, follow: false },
};

export default function SceneLabIndex() {
  return (
    <div className={`${shell.page} ${k.main}`} data-theme="welabs">
      <ul>
        {SCENE_IDS.map((id) => (
          <li key={id}>
            <Link href={`/lab/scenes/${id}`}>{id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
