import { FaFileInvoiceDollar, FaPlus, FaSearch } from "react-icons/fa";
import FilterDropdown from "./FilterDropdown";
import InvoiceStats from "./InvoiceStats";

export default function InvoiceHeader({
  resetForm,
  setIsModalOpen,
  filters,
  setFilters,
  suppliers,
  searchTerm,
  setSearchTerm,
  invoiceStats,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* عنوان الصفحة وزر الإضافة */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FaFileInvoiceDollar className="text-blue-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">إدارة الفواتير</h1>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md w-full md:w-auto justify-center"
        >
          <FaPlus />
          <span>إضافة فاتورة جديدة</span>
        </button>
      </div>

      {/* إحصائيات */}
      <InvoiceStats stats={invoiceStats} />

      {/* قوائم التصفية */}
      <FilterDropdown
        filters={filters}
        setFilters={setFilters}
        suppliers={suppliers}
      />

      {/* شريط البحث */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="relative">
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث في الفواتير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
          />
        </div>
      </div>
    </div>
  );
} 