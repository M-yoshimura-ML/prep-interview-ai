'use client';

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Tooltip,
  Button,
  Link,
  Select,
  SelectItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Key } from "@react-types/shared";
import toast from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { IUser } from '@/backend/models/user.model';
import CustomPagination from "@/components/layout/pagination/CustomPagination";
import UpdateUser from "./UpdateUser";

export const columns = [
  { name: "USER", uid: "user" },
  { name: "LOGINS", uid: "logins" },
  { name: "SUBSCRIPTION", uid: "subscription" },
  { name: "ACTIONS", uid: "actions" },
];

type Props = {
    data: {
        users: IUser[],
        resultsPerPage: number
        filteredCount: number,
    }
}
const ListUsers = ({ data }: Props) => {
    const { users, resultsPerPage, filteredCount } = data;

    const router = useRouter();

    // const deleteInterviewHandler = async (interviewId: string) => {
    //     const res = await deleteInterview(interviewId);

    //     if(res?.error) {
    //     return toast.error(res?.error?.message);
    //     }

    //     if(res?.deleted) {
    //         toast.success("Interview is deleted");
    //         router.push("/admin/interviews");
    //     }
    // }

    let queryParams;

    const handleStatusChange = (status: string) => {
        queryParams = new URLSearchParams(window.location.search);
        if(queryParams.has("subscription.status") && status === "all") {
            queryParams.delete("subscription.status");
        } else if(queryParams.has("subscription.status")) {
            queryParams.set("subscription.status", status);
        } else {
            queryParams.append("subscription.status", status);
        }
        const path = `${window.location.pathname}?${queryParams.toString()}`;
        router.push(path);
    };

    const renderCell = React.useCallback(
        (user: IUser, columnKey: Key) => {
        const cellValue = user[columnKey as keyof IUser];

        switch (columnKey) {
            case "user":
                return (
                    <div className="flex flex-col">
                        <p className="text-bold text-sm">{user?.name}</p>
                        <p className="text-bold text-sm text-default-400">
                            {user?.email}
                        </p>
                    </div>
                );
            case "logins":
                return (
                    <div className="flex flex-col gap-2">
                        {user?.authProviders?.map((provider, index) => (
                            <Chip
                                key={index}
                                className="capitalize"
                                color={"warning"}
                                size="sm"
                                variant="flat"
                            >
                                {provider?.provider}
                            </Chip>
                        ))}
                    </div>
                );
            case "subscription":
                return (
                    <Chip
                        className="capitalize"
                        color={user?.subscription?.status === "active" ? "success" : "danger"}
                        size="sm"
                        variant="flat"
                    >
                        {user?.subscription?.status ?? "No Subscription"}
                    </Chip>
                );
            case "actions":
                return (
                <div className="relative flex items-center justify-center gap-2">
                    <UpdateUser user={user} />
                    
                    <Tooltip color="danger" content="Cancel Subscription">
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                            <Icon
                                icon="solar:shield-cross-bold"
                                fontSize={22}
                                onClick={() => {}}
                            />
                        </span>
                    </Tooltip>
                    

                    <Tooltip color="danger" content="Delete User">
                        <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <Icon
                            icon="solar:trash-bin-trash-outline"
                            fontSize={21}
                            onClick={() => {}}
                        />
                        </span>
                    </Tooltip>
                </div>
                );
            default:
                return cellValue;
        }
        },
        []
    );

    return (
        <div className="my-4">
          <div className="flex items-center justify-end mb-4">
            <Select size="sm" className="max-w-xs" label="Select a status"
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <SelectItem key={"all"}>All</SelectItem>
              <SelectItem key={"active"}>Active</SelectItem>
              <SelectItem key={"canceled"}>Canceled</SelectItem>
              <SelectItem key={"past_due"}>Past Due</SelectItem>
            </Select>
          </div>
          <Table aria-label="Interivews table">
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={users}>
              {(item) => (
                <TableRow key={item._id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
    
          <div className="flex justify-center items-center mt-10">
            <CustomPagination resPerPage={resultsPerPage} filteredCount={filteredCount} />
          </div>
        </div>
    )
}

export default ListUsers