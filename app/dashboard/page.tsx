import FullLinkupApp, { type PreviewScenario } from "./full-linkup-app"

const previewScenarios: PreviewScenario[] = ["ready", "empty", "loading", "error"]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ crewPreview?: string; scenario?: string }>
}) {
  const { crewPreview, scenario } = await searchParams
  const preview = process.env.NODE_ENV === "development" && crewPreview === "1"
  const previewScenario = previewScenarios.includes(scenario as PreviewScenario)
    ? (scenario as PreviewScenario)
    : "ready"

  return <FullLinkupApp preview={preview} previewScenario={previewScenario} />
}
