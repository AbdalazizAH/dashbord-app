export default function Loading() {
  return (
    <div className="h-[92vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-md"></div>
        <p className="mt-6 text-gray-700 text-lg font-medium tracking-wide">
          جاري التحميل...
        </p>
        <div className="mt-4 w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden shadow-inner">
          <div className="w-1/2 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse"></div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    </div>
  );
}
