import CrewRoute from "../../_components/crew-route"

/** Expenses are retired in v1; this legacy URL now lands in shared planning. */
export default function ExpensesPage() {
  return <CrewRoute view="plan" />
}
