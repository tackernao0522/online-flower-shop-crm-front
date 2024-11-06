"use client";
import React, { useState } from "react";
import { Order } from "@/types/order";
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  VStack,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ArrowBackIcon,
  ViewIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

const OrdersPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [modalMode, setModalMode] = useState("detail"); // 'detail', 'add', 'edit'

  const router = useRouter();

  const orders: Order[] = [
    {
      id: 1,
      customerName: "山田太郎",
      date: "2023-05-15",
      amount: 12000,
      status: "配送中",
    },
    {
      id: 2,
      customerName: "佐藤花子",
      date: "2023-05-16",
      amount: 8500,
      status: "準備中",
    },
  ];

  const handleOrderClick = (order: Order) => {
    setActiveOrder(order);
    setModalMode("detail");
    onOpen();
  };

  const handleAddOrder = () => {
    setActiveOrder(null);
    setModalMode("add");
    onOpen();
  };

  const handleEditOrder = (order: Order) => {
    setActiveOrder(order);
    setModalMode("edit");
    onOpen();
  };

  const renderOrderForm = () => (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>顧客名</FormLabel>
        <Input defaultValue={activeOrder?.customerName} />
      </FormControl>
      <FormControl>
        <FormLabel>注文日</FormLabel>
        <Input type="date" defaultValue={activeOrder?.date} />
      </FormControl>
      <FormControl>
        <FormLabel>金額</FormLabel>
        <Input type="number" defaultValue={activeOrder?.amount} />
      </FormControl>
      <FormControl>
        <FormLabel>状態</FormLabel>
        <Select defaultValue={activeOrder?.status}>
          <option value="準備中">準備中</option>
          <option value="配送中">配送中</option>
          <option value="配達完了">配達完了</option>
        </Select>
      </FormControl>
    </VStack>
  );

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" alignItems="center" mb={5}>
        <Heading as="h1" size="xl">
          注文管理
        </Heading>
        <HStack>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddOrder}>
            新規注文作成
          </Button>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard")}>
            ダッシュボードへ戻る
          </Button>
        </HStack>
      </Flex>

      <Flex mb={5}>
        <Input placeholder="注文IDまたは顧客名で検索" mr={3} />
        <Button>検索</Button>
      </Flex>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>注文ID</Th>
            <Th>顧客名</Th>
            <Th>注文日</Th>
            <Th>金額</Th>
            <Th>状態</Th>
            <Th>アクション</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.id}>
              <Td>{order.id}</Td>
              <Td>{order.customerName}</Td>
              <Td>{order.date}</Td>
              <Td>¥{order.amount.toLocaleString()}</Td>
              <Td>
                <Badge
                  colorScheme={order.status === "配送中" ? "green" : "yellow"}>
                  {order.status}
                </Badge>
              </Td>
              <Td>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<ViewIcon />}
                    onClick={() => handleOrderClick(order)}>
                    詳細
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    onClick={() => handleEditOrder(order)}>
                    編集
                  </Button>
                  <Button size="sm" leftIcon={<DeleteIcon />} colorScheme="red">
                    削除
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalMode === "detail"
              ? "注文詳細"
              : modalMode === "add"
              ? "新規注文作成"
              : "注文編集"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>注文情報</Tab>
                <Tab>顧客情報</Tab>
                <Tab>配送情報</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {modalMode === "detail" ? (
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <strong>注文ID:</strong> {activeOrder?.id}
                      </Box>
                      <Box>
                        <strong>顧客名:</strong> {activeOrder?.customerName}
                      </Box>
                      <Box>
                        <strong>注文日:</strong> {activeOrder?.date}
                      </Box>
                      <Box>
                        <strong>金額:</strong> ¥
                        {activeOrder?.amount.toLocaleString()}
                      </Box>
                      <Box>
                        <strong>状態:</strong> {activeOrder?.status}
                      </Box>
                    </VStack>
                  ) : (
                    renderOrderForm()
                  )}
                </TabPanel>
                <TabPanel>
                  <p>顧客情報をここに表示</p>
                </TabPanel>
                <TabPanel>
                  <p>配送情報をここに表示</p>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            {modalMode !== "detail" && (
              <Button colorScheme="blue" mr={3}>
                保存
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OrdersPage;
