import { renderHook, act } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { useCustomerManagement } from "../useCustomerManagement";
import { useDispatch, useSelector } from "react-redux";
import { useToast, useDisclosure, useBreakpointValue } from "@chakra-ui/react";
import { useInView } from "react-intersection-observer";
import {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/features/customers/customersSlice";
import { Customer } from "@/types/customer";

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@chakra-ui/react", () => ({
  useToast: jest.fn(),
  useDisclosure: jest.fn(),
  useBreakpointValue: jest.fn(),
}));

jest.mock("react-intersection-observer", () => ({
  useInView: jest.fn(),
}));

jest.mock("@/features/customers/customersSlice", () => ({
  fetchCustomers: jest.fn(),
  addCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
}));

describe("useCustomerManagement フック", () => {
  let mockDispatch: jest.Mock;
  let mockSelector: jest.Mock;
  let mockToast: jest.Mock;
  let mockDisclosure: jest.Mock;
  let mockBreakpointValue: jest.Mock;
  let mockInView: jest.Mock;

  beforeEach(() => {
    mockDispatch = jest.fn((action) => {
      if (typeof action === "function") {
        return action(mockDispatch);
      }
      return action;
    });
    mockSelector = jest
      .fn()
      .mockReturnValue({ status: "idle", error: null, customers: [] });
    mockToast = jest.fn();
    mockDisclosure = jest.fn().mockReturnValue({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    });
    mockBreakpointValue = jest.fn().mockReturnValue(false);
    mockInView = jest.fn().mockReturnValue([null, false]);

    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useSelector as jest.Mock).mockImplementation(mockSelector);
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useDisclosure as jest.Mock).mockImplementation(mockDisclosure);
    (useBreakpointValue as jest.Mock).mockImplementation(mockBreakpointValue);
    (useInView as jest.Mock).mockImplementation(mockInView);

    window.scrollTo = jest.fn();
  });

  test("初期状態が正しく設定される", () => {
    const { result } = renderHook(() => useCustomerManagement());

    expect(result.current.customers).toEqual([]);
    expect(result.current.status).toBe("idle");
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.page).toBe(1);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
    expect(result.current.searchTerm).toBe("");
    expect(result.current.showScrollTop).toBe(false);
    expect(result.current.newCustomer).toEqual({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      birthDate: "",
    });
    expect(result.current.formErrors).toEqual({});
    expect(result.current.isMobile).toBe(false);
  });

  // test("fetchCustomersData が正しく動作する", async () => {
  //   const mockCustomers = [{ id: "1", name: "Test User" }];
  //   const mockAction = {
  //     type: "customers/fetchCustomers/fulfilled",
  //     payload: {
  //       data: mockCustomers,
  //       meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
  //     },
  //   };
  //   (fetchCustomers as jest.Mock).mockResolvedValue(mockAction);

  //   const { result } = renderHook(() => useCustomerManagement());

  //   await act(async () => {
  //     await result.current.fetchCustomersData();
  //   });

  //   expect(result.current.customers).toEqual(mockCustomers);
  //   expect(result.current.loading).toBe(false);
  //   expect(mockDispatch).toHaveBeenCalled();
  // });

  test("handleCustomerClick が正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());
    const mockCustomer = { id: "1", name: "Test User" } as Customer;

    act(() => {
      result.current.handleCustomerClick(mockCustomer);
    });

    expect(result.current.activeCustomer).toEqual(mockCustomer);
    expect(result.current.modalMode).toBe("detail");
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test("handleAddCustomer が正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleAddCustomer();
    });

    expect(result.current.activeCustomer).toBeNull();
    expect(result.current.modalMode).toBe("add");
    expect(result.current.newCustomer).toEqual({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      birthDate: "",
    });
    expect(result.current.formErrors).toEqual({});
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test("handleEditCustomer が正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());
    const mockCustomer = {
      id: "1",
      name: "Test User",
      email: "test@example.com",
      phoneNumber: "1234567890",
      address: "Test Address",
      birthDate: "1990-01-01T00:00:00.000Z",
    } as Customer;

    act(() => {
      result.current.handleEditCustomer(mockCustomer);
    });

    expect(result.current.activeCustomer).toEqual(mockCustomer);
    expect(result.current.modalMode).toBe("edit");
    expect(result.current.newCustomer).toEqual({
      name: "Test User",
      email: "test@example.com",
      phoneNumber: "1234567890",
      address: "Test Address",
      birthDate: "1990-01-01",
    });
    expect(result.current.formErrors).toEqual({});
    expect(mockDisclosure().onOpen).toHaveBeenCalled();
  });

  test("handleDeleteCustomer が正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());
    const mockCustomer = { id: "1", name: "Test User" } as Customer;

    act(() => {
      result.current.handleDeleteCustomer(mockCustomer);
    });

    expect(result.current.customerToDelete).toEqual(mockCustomer);
    expect(result.current.isDeleteAlertOpen).toBe(true);
  });

  test("confirmDelete が正しく動作する", async () => {
    const mockCustomer = { id: "1", name: "Test User" } as Customer;
    const mockAction = {
      type: "customers/deleteCustomer/fulfilled",
      payload: "1",
    };
    (deleteCustomer as jest.Mock).mockResolvedValue(mockAction);

    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleDeleteCustomer(mockCustomer);
    });

    await act(async () => {
      await result.current.confirmDelete();
    });

    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "顧客を削除しました",
        status: "warning",
      })
    );
  });

  test("cancelDelete が正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleDeleteCustomer({
        id: "1",
        name: "Test User",
      } as Customer);
      result.current.cancelDelete();
    });

    expect(result.current.isDeleteAlertOpen).toBe(false);
    expect(result.current.customerToDelete).toBeNull();
  });

  test("handleSearch が正しく動作する", async () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleSearch("test");
    });

    await waitFor(() => {
      expect(result.current.searchTerm).toBe("test");
      expect(result.current.page).toBe(1);
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test("handleKeyDown が正しく動作する", async () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.setSearchTerm("test");
    });

    act(() => {
      result.current.handleKeyDown({
        key: "Enter",
        preventDefault: jest.fn(),
      } as unknown as React.KeyboardEvent<HTMLInputElement>);
    });

    await waitFor(() => {
      expect(result.current.searchTerm).toBe("test");
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test("handleInputChange が正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleInputChange({
        target: { name: "name", value: "New Name" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.newCustomer.name).toBe("New Name");
    expect(result.current.formErrors.name).toBe("");
  });

  // test("handleSubmit が新規追加時に正しく動作する", async () => {
  //   const mockNewCustomer = {
  //     id: "2",
  //     name: "New User",
  //     email: "new@example.com",
  //     phoneNumber: "090-1234-5678",
  //     address: "New Address",
  //     birthDate: "1990-01-01",
  //   };
  //   const mockAction = {
  //     type: "customers/addCustomer/fulfilled",
  //     payload: mockNewCustomer,
  //   };
  //   (addCustomer as jest.Mock).mockResolvedValue(mockAction);
  //   (fetchCustomers as jest.Mock).mockResolvedValue({
  //     type: "customers/fetchCustomers/fulfilled",
  //     payload: {
  //       data: [mockNewCustomer],
  //       meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
  //     },
  //   });

  //   const { result } = renderHook(() => useCustomerManagement());

  //   await act(async () => {
  //     result.current.handleAddCustomer();
  //     Object.entries(mockNewCustomer).forEach(([key, value]) => {
  //       result.current.handleInputChange({
  //         target: { name: key, value },
  //       } as React.ChangeEvent<HTMLInputElement>);
  //     });
  //     await result.current.handleSubmit();
  //   });

  //   expect(mockDispatch).toHaveBeenCalled();
  //   expect(mockToast).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       title: "顧客を登録しました",
  //       status: "success",
  //     })
  //   );
  //   expect(mockDisclosure().onClose).toHaveBeenCalled();
  // });

  // test("handleSubmit が更新時に正しく動作する", async () => {
  //   const mockUpdatedCustomer = {
  //     id: "1",
  //     name: "Updated User",
  //     email: "updated@example.com",
  //     phoneNumber: "090-9876-5432",
  //     address: "Updated Address",
  //     birthDate: "1985-12-31",
  //   };
  //   const mockAction = {
  //     type: "customers/updateCustomer/fulfilled",
  //     payload: mockUpdatedCustomer,
  //   };
  //   (updateCustomer as jest.Mock).mockResolvedValue(mockAction);
  //   (fetchCustomers as jest.Mock).mockResolvedValue({
  //     type: "customers/fetchCustomers/fulfilled",
  //     payload: {
  //       data: [mockUpdatedCustomer],
  //       meta: { currentPage: 1, totalPages: 1, totalCount: 1 },
  //     },
  //   });

  //   const { result } = renderHook(() => useCustomerManagement());

  //   await act(async () => {
  //     result.current.handleEditCustomer(mockUpdatedCustomer as Customer);
  //     Object.entries(mockUpdatedCustomer).forEach(([key, value]) => {
  //       result.current.handleInputChange({
  //         target: { name: key, value },
  //       } as React.ChangeEvent<HTMLInputElement>);
  //     });
  //     await result.current.handleSubmit();
  //   });

  //   expect(mockDispatch).toHaveBeenCalled();
  //   expect(mockToast).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       title: "顧客情報を更新しました",
  //       status: "success",
  //     })
  //   );
  //   expect(mockDisclosure().onClose).toHaveBeenCalled();
  // });

  test("scrollToTop が正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.scrollToTop();
    });

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  // test("無限スクロールが正しく動作する", async () => {
  //   const mockCustomers1 = [{ id: "1", name: "Test User 1" }];
  //   const mockCustomers2 = [{ id: "2", name: "Test User 2" }];
  //   const mockAction1 = {
  //     type: "customers/fetchCustomers/fulfilled",
  //     payload: {
  //       data: mockCustomers1,
  //       meta: { currentPage: 1, totalPages: 2, totalCount: 2 },
  //     },
  //   };
  //   const mockAction2 = {
  //     type: "customers/fetchCustomers/fulfilled",
  //     payload: {
  //       data: mockCustomers2,
  //       meta: { currentPage: 2, totalPages: 2, totalCount: 2 },
  //     },
  //   };
  //   (fetchCustomers as jest.Mock)
  //     .mockResolvedValueOnce(mockAction1)
  //     .mockResolvedValueOnce(mockAction2);
  //   (useInView as jest.Mock).mockReturnValue([null, true]);

  //   const { result } = renderHook(() => useCustomerManagement());

  //   expect(result.current.page).toBe(1);

  //   await act(async () => {
  //     await result.current.fetchCustomersData();
  //   });

  //   expect(result.current.page).toBe(1);
  //   expect(result.current.customers).toEqual(mockCustomers1);

  //   // inViewがtrueの場合、ページが自動的に更新される
  //   await act(async () => {
  //     await result.current.fetchCustomersData();
  //   });

  //   expect(result.current.page).toBe(2);
  //   expect(result.current.customers).toEqual([
  //     ...mockCustomers1,
  //     ...mockCustomers2,
  //   ]);
  //   expect(result.current.hasMore).toBe(false);
  // });

  test("debouncedFetchCustomers が正しく動作する", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleSearch("test");
    });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.searchTerm).toBe("test");
      expect(result.current.page).toBe(1);
    });

    expect(mockDispatch).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test("スクロールイベントリスナーのuseEffectが正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      window.pageYOffset = 400;
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current.showScrollTop).toBe(true);

    act(() => {
      window.pageYOffset = 200;
      window.dispatchEvent(new Event("scroll"));
    });

    expect(result.current.showScrollTop).toBe(false);
  });

  test("validateForm が正しく動作する", () => {
    const { result } = renderHook(() => useCustomerManagement());

    act(() => {
      result.current.handleAddCustomer();
    });

    act(() => {
      result.current.handleSubmit();
    });

    expect(result.current.formErrors).toEqual({
      name: "名前は必須です",
      email: "有効なメールアドレスを入力してください",
      phoneNumber: "有効な電話番号を入力してください（例: 090-1234-5678）",
      address: "住所は必須です",
      birthDate: "生年月日は必須です",
    });
  });

  // test("不正なフォームデータでhandleSubmitが正しく動作する", async () => {
  //   const { result } = renderHook(() => useCustomerManagement());

  //   act(() => {
  //     result.current.handleAddCustomer();
  //   });

  //   await act(async () => {
  //     await result.current.handleSubmit();
  //   });

  //   expect(mockDispatch).not.toHaveBeenCalled();
  //   expect(mockToast).not.toHaveBeenCalled();
  //   expect(result.current.formErrors).not.toEqual({});
  // });

  // test("inViewのuseEffectが正しく動作する", async () => {
  //   (useInView as jest.Mock).mockReturnValue([null, true]);
  //   const mockCustomers1 = [{ id: "1", name: "Test User 1" }];
  //   const mockAction1 = {
  //     type: "customers/fetchCustomers/fulfilled",
  //     payload: {
  //       data: mockCustomers1,
  //       meta: { currentPage: 1, totalPages: 2, totalCount: 2 },
  //     },
  //   };
  //   (fetchCustomers as jest.Mock).mockResolvedValue(mockAction1);

  //   const { result } = renderHook(() => useCustomerManagement());

  //   await act(async () => {
  //     await result.current.fetchCustomersData();
  //   });

  //   expect(result.current.page).toBe(2);
  // });
});
