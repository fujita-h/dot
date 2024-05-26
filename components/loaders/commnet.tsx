export function CommentLoader() {
  return (
    <div className="space-y-2 px-4 py-6">
      <div className="flex space-x-3">
        <div className="w-9/12 h-2 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="flex space-x-2">
        <div className="w-4/12 h-2 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-4/12 h-2 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-2/12 h-2 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="flex space-x-3">
        <div className="w-2/12 h-2 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-4/12 h-2 bg-gray-200 rounded-full animate-pulse" />
        <div className="w-2/12 h-2 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="flex space-x-3">
        <div className="w-10/12 h-2 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function CommentEditorLoader() {
  return (
    <div>
      <div className="border border-gray-200 rounded-lg p-2 min-h-40">
        <div className="flex space-x-3 pb-2 border-b">
          <div className="w-12 h-8 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse" />
          <div className="w-8 h-8 bg-gray-100 rounded-md animate-pulse" />
        </div>
        <div className="flex space-x-3 pt-4 ml-2">
          <div className="w-3/12 h-2 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <div className="w-24 h-8 bg-gray-100 rounded-md animate-pulse p-2 text-center text-sm text-gray-500">
          Loading...
        </div>
      </div>
    </div>
  );
}
