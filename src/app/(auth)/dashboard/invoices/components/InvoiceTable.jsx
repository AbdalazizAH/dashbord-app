import { FaEdit, FaTrash, FaEye, FaPrint, FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";

export default function InvoiceTable({
  invoices,
  suppliers,
  filters,
  searchTerm,
  onEdit,
  onDelete,
  onComplete,
  loadingInvoiceId,
  setLoadingInvoiceId
}) {
  const router = useRouter();

  // تصفية الفواتير
  const filteredInvoices = invoices
    .filter((invoice) => {
      // تصفية حسب حالة الدفع
      if (filters.status !== "all" && invoice.Status !== filters.status)
        return false;

      // تصفية حسب حالة الإكمال
      if (
        filters.completion !== "all" &&
        ((filters.completion === "completed" && !invoice.is_completed) ||
          (filters.completion === "incomplete" && invoice.is_completed))
      )
        return false;

      // تصفية حسب المورد
      if (filters.supplier !== "all" && invoice.SupplierID !== filters.supplier)
        return false;

      // تصفية حسب البحث
      if (searchTerm) {
        return invoice.InvoiceName.toLowerCase().includes(
          searchTerm.toLowerCase()
        );
      }

      return true;
    })
    .sort((a, b) => new Date(b.InvoiceDate) - new Date(a.InvoiceDate));

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الفاتورة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المورد
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المبلغ الإجمالي
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المدفوع
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المتبقي
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                حالة الإكمال
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.InvoiceID}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.InvoiceName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(invoice.InvoiceDate).toLocaleDateString("ar-LY")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {suppliers.find((s) => s.SupplierID === invoice.SupplierID)
                      ?.SupplierName || "غير محدد"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.TotalAmount?.toLocaleString("ar-LY")} د.ل
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-600 font-medium">
                    {invoice.Paid?.toLocaleString("ar-LY")} د.ل
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-red-600 font-medium">
                    {invoice.Due?.toLocaleString("ar-LY")} د.ل
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.Status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : invoice.Status === "Partially Paid"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {invoice.Status === "Paid"
                      ? "مدفوعة"
                      : invoice.Status === "Partially Paid"
                      ? "مدفوعة جزئياً"
                      : "غير مدفوعة"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(invoice.InvoiceDate).toLocaleDateString("ar-LY")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.is_completed
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {invoice.is_completed ? "مكتملة" : "غير مكتملة"}
                    </span>
                    {!invoice.is_completed && (
                      <button
                        onClick={() => onComplete(invoice.InvoiceID)}
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-150 text-sm"
                        title="إكمال الفاتورة"
                      >
                        إكمال
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        setLoadingInvoiceId(invoice.InvoiceID);
                        router.push(`/dashboard/invoices/${invoice.InvoiceID}`);
                      }}
                      className="text-gray-600 hover:text-gray-800 transition-colors duration-150"
                      title="عرض التفاصيل"
                      disabled={loadingInvoiceId === invoice.InvoiceID}
                    >
                      {loadingInvoiceId === invoice.InvoiceID ? (
                        <FaSpinner className="animate-spin" size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                    {!invoice.is_completed && (
                      <>
                        <button
                          onClick={() => onEdit(invoice)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                          title="تعديل"
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(invoice.InvoiceID)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-150"
                          title="حذف"
                        >
                          <FaTrash size={18} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => window.print()}
                      className="text-gray-600 hover:text-gray-800 transition-colors duration-150 print:hidden"
                      title="طباعة"
                    >
                      <FaPrint size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 