"use client";
import { Suspense } from "react";
import InvoiceHeader from "./components/InvoiceHeader";
import InvoiceModal from "./components/InvoiceModal";
import InvoiceData from "./components/InvoiceData";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import useInvoiceForm from "./hooks/useInvoiceForm";

export default function Invoices() {
  const {
    formData,
    setFormData,
    newItem,
    setNewItem,
    isModalOpen,
    setIsModalOpen,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    loadingInvoiceId,
    setLoadingInvoiceId,
    isSubmitting,
    products,
    suppliers,
    invoices,
    editingId,
    handleSubmit,
    handleAddItem,
    handleRemoveItem,
    handleEdit,
    handleDelete,
    handleComplete,
    calculateTotal,
    resetForm,
  } = useInvoiceForm();

  // إنشاء إحصائيات الفواتير
  const invoiceStats = {
    total: invoices?.length || 0,
    paid: invoices?.filter((inv) => inv.Status === "paid").length || 0,
    unpaid: invoices?.filter((inv) => inv.Status === "unpaid").length || 0,
    completed: invoices?.filter((inv) => inv.is_completed).length || 0,
    incomplete: invoices?.filter((inv) => !inv.is_completed).length || 0,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <InvoiceHeader
        resetForm={resetForm}
        setIsModalOpen={setIsModalOpen}
        filters={filters}
        setFilters={setFilters}
        suppliers={suppliers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        invoiceStats={invoiceStats}
      />

      <Suspense fallback={<LoadingSpinner />}>
        <InvoiceData
          invoices={invoices}
          suppliers={suppliers}
          filters={filters}
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onComplete={handleComplete}
          loadingInvoiceId={loadingInvoiceId}
          setLoadingInvoiceId={setLoadingInvoiceId}
        />
      </Suspense>

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        newItem={newItem}
        setNewItem={setNewItem}
        products={products}
        suppliers={suppliers}
        handleSubmit={handleSubmit}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
        calculateTotal={calculateTotal}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
