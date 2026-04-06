export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Commissions</h2>
        <p className="text-sm text-gray-500 mt-1">
          Synced from Google Sheets · AI summaries available.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-400">
        Connect your commissions Google Sheet to see data here.
      </div>
    </div>
  );
}
