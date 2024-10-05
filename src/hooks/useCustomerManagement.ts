import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/features/customers/customersSlice";
import { Customer } from "@/types/customer";
import { useToast, useDisclosure, useBreakpointValue } from "@chakra-ui/react";
import { useInView } from "react-intersection-observer";

const PAGE_SIZE = 20;

const useDebounce = (func: (...args: any[]) => void, delay: number) => {
  const debouncedFunc = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, [func, delay]);

  return debouncedFunc;
};

export const useCustomerManagement = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "add" | "edit">(
    "detail"
  );
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.customers);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const toast = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newCustomer, setNewCustomer] = useState<
    Omit<Customer, "id" | "created_at" | "updated_at" | "purchaseHistory">
  >({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Customer>>({});

  const isMobile = useBreakpointValue({ base: true, md: false });

  const fetchCustomersData = useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        `Fetching customers: page=${page}, search="${searchTerm.trim()}"`
      );
      const result = await dispatch(
        fetchCustomers({ page, search: searchTerm.trim() })
      );
      if (fetchCustomers.fulfilled.match(result)) {
        setCustomers((prevCustomers) => {
          const newCustomers = result.payload.data;
          if (page === 1) return newCustomers;

          // Remove duplicates with proper typing for 'item'
          const uniqueCustomers = [...prevCustomers, ...newCustomers].reduce(
            (acc: Customer[], current: Customer) => {
              const x = acc.find((item: Customer) => item.id === current.id);
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            },
            []
          );

          return uniqueCustomers;
        });
        setHasMore(result.payload.data.length === PAGE_SIZE);
        console.log(`Fetched ${result.payload.data.length} customers`);
      } else {
        console.error("Failed to fetch customers:", result.error);
        toast({
          title: "顧客データの取得に失敗しました",
          description: "しばらく待ってから再度お試しください。",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast({
        title: "エラーが発生しました",
        description: "顧客データの取得中に問題が発生しました。",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [dispatch, page, searchTerm, toast]);

  const debouncedFetchCustomers = useDebounce((term: string) => {
    setPage(1);
    setCustomers([]);
    fetchCustomersData();
  }, 300);

  useEffect(() => {
    fetchCustomersData();
  }, [fetchCustomersData]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCustomerClick = useCallback(
    (customer: Customer) => {
      setActiveCustomer(customer);
      setModalMode("detail");
      onOpen();
    },
    [onOpen]
  );

  const handleAddCustomer = useCallback(() => {
    setActiveCustomer(null);
    setModalMode("add");
    setNewCustomer({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      birthDate: "",
    });
    setFormErrors({});
    onOpen();
  }, [onOpen]);

  const handleEditCustomer = useCallback(
    (customer: Customer) => {
      setActiveCustomer(customer);
      setNewCustomer({
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        birthDate: customer.birthDate.split("T")[0],
      });
      setModalMode("edit");
      setFormErrors({});
      onOpen();
    },
    [onOpen]
  );

  const handleDeleteCustomer = useCallback((customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteAlertOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (customerToDelete) {
      try {
        await dispatch(deleteCustomer(customerToDelete.id));
        setCustomers((prevCustomers) =>
          prevCustomers.filter((c) => c.id !== customerToDelete.id)
        );
        toast({
          title: "顧客を削除しました",
          description: `${customerToDelete.name} の情報が削除されました。`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "顧客の削除に失敗しました",
          description: "エラーが発生しました。もう一度お試しください。",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setIsDeleteAlertOpen(false);
      setCustomerToDelete(null);
    }
  }, [customerToDelete, dispatch, toast]);

  const cancelDelete = useCallback(() => {
    setIsDeleteAlertOpen(false);
    setCustomerToDelete(null);
  }, []);

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (term.trim() !== "") {
        debouncedFetchCustomers(term);
      } else {
        setPage(1);
        setCustomers([]);
        fetchCustomersData();
      }
    },
    [debouncedFetchCustomers, fetchCustomersData]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch(searchTerm);
      }
    },
    [handleSearch, searchTerm]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setNewCustomer((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const validateForm = useCallback(() => {
    const errors: Partial<Customer> = {};
    if (!newCustomer.name) errors.name = "名前は必須です";
    if (!newCustomer.email) errors.email = "メールアドレスは必須です";
    if (!/^\S+@\S+\.\S+$/.test(newCustomer.email))
      errors.email = "有効なメールアドレスを入力してください";
    if (!newCustomer.phoneNumber) errors.phoneNumber = "電話番号は必須です";
    if (!/^\d{2,4}-\d{2,4}-\d{3,4}$/.test(newCustomer.phoneNumber))
      errors.phoneNumber =
        "有効な電話番号を入力してください（例: 090-1234-5678）";
    if (!newCustomer.address) errors.address = "住所は必須です";
    if (!newCustomer.birthDate) errors.birthDate = "生年月日は必須です";
    return errors;
  }, [newCustomer]);

  const handleSubmit = useCallback(async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      let resultAction;
      if (modalMode === "add") {
        resultAction = await dispatch(addCustomer(newCustomer));
      } else if (modalMode === "edit" && activeCustomer) {
        resultAction = await dispatch(
          updateCustomer({ id: activeCustomer.id, customerData: newCustomer })
        );
      }
      if (
        resultAction &&
        (addCustomer.fulfilled.match(resultAction) ||
          updateCustomer.fulfilled.match(resultAction))
      ) {
        toast({
          title:
            modalMode === "add"
              ? "顧客を登録しました"
              : "顧客情報を更新しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setPage(1);
        setCustomers([]);
        fetchCustomersData();
      } else if (resultAction) {
        // 失敗時の処理
        toast({
          title:
            modalMode === "add"
              ? "顧客の登録に失敗しました"
              : "顧客情報の更新に失敗しました",
          description: resultAction.error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(
        modalMode === "add"
          ? "Failed to add customer:"
          : "Failed to update customer:",
        error
      );
      toast({
        title: "エラーが発生しました",
        description:
          modalMode === "add"
            ? "顧客の登録中に問題が発生しました。"
            : "顧客情報の更新中に問題が発生しました。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [
    validateForm,
    modalMode,
    activeCustomer,
    dispatch,
    newCustomer,
    onClose,
    toast,
    fetchCustomersData,
  ]);

  return {
    isOpen,
    onOpen,
    onClose,
    activeCustomer,
    modalMode,
    customers,
    status,
    error,
    loading,
    page,
    hasMore,
    isDeleteAlertOpen,
    customerToDelete,
    searchTerm,
    showScrollTop,
    newCustomer,
    formErrors,
    isMobile,
    handleCustomerClick,
    handleAddCustomer,
    handleEditCustomer,
    handleDeleteCustomer,
    confirmDelete,
    cancelDelete,
    handleSearch,
    handleKeyDown,
    handleInputChange,
    handleSubmit,
    scrollToTop,
    ref,
    setSearchTerm,
    fetchCustomersData,
  };
};
