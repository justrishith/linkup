"use client"

import FullLinkupApp, { type CrewView } from "../dashboard/full-linkup-app"

/** Keeps historic URLs useful without ever rendering their retired interface. */
export default function CrewRoute({ view }: { view: CrewView }) {
  return <FullLinkupApp initialView={view} />
}
