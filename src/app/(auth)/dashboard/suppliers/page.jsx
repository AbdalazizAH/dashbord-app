"use client";
import { Suspense } from "react";
import { useSupplierForm } from "./hooks/useSupplierForm";
import SupplierHeader from "./components/SupplierHeader";
import SupplierData from "./components/SupplierData";
import SupplierModal from "./components/SupplierModal";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function Suppliers() {
  const {
    isModalOpen,
    setIsModalOpen,
    searchTerm,
    setSearchTerm,
    formData,
    setFormData,
    editingId,
    handleSubmit,
    handleDelete,
    handleEdit,
    resetForm,
  } = useSupplierForm();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col gap-6">
        <SupplierHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        />

        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[200px]">
              <LoadingSpinner />
            </div>
          }
        >
          <SupplierData
            searchTerm={searchTerm}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Suspense>

        <SupplierModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          editingId={editingId}
        />
      </div>
    </div>
  );
}
