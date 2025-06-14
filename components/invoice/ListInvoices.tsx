'use client';

import React, { useState } from 'react'
import Stripe from 'stripe'
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
  Pagination,
  Alert,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { Key } from "@react-types/shared";
import { getTotalPages, paginate } from '@/helpers/helpers';

export const columns = [
  { name: "Invoice", uid: "invoice" },
  { name: "BILL PAID", uid: "bill" },
  { name: "BILLING DATE", uid: "date" },
  { name: "ACTIONS", uid: "actions" },
];

interface Props {
  invoices: Stripe.Invoice[]
}

const ListInvoices = ({ invoices }: Props) => {

  const [currentPage, setCurrentPage] = useState(1);
    const invoicesPerPage = 2;
  
    const totalPages = getTotalPages(invoices?.length, invoicesPerPage);
  
    const currentInvoices = paginate(invoices, currentPage, invoicesPerPage);
  
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    }

  if(!invoices || invoices.length === 0) {
    return (
      <div className="flex justify-center">
        <p>No Invoices found</p>
      </div>
    )
  }

  const lastInvoice = invoices[0];

  const renderCell = React.useCallback(
    (invoice: Stripe.Invoice, columnKey: Key) => {
      const cellValue = invoice[columnKey as keyof Stripe.Invoice];

      switch (columnKey) {
        case "invoice":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-sm capitalize">{invoice?.account_name}</p>
              <p className="text-bold text-sm capitalize text-default-400">
                {invoice?.id}
              </p>
            </div>
          );
        case "bill":
          return (
            <Chip 
              className="capitalize"
              color={"success"}
              size="sm"
              variant="flat"
            >
              {invoice?.amount_paid / 100} 
            </Chip>
          );
        case "date":
          return (
            <p className="text-bold text-sm text-default-400">
              {new Date(invoice?.lines?.data[0]?.period?.end * 1000).toLocaleDateString()}
            </p>
          );
        case "actions":
          return (
            <div className="relative flex items-center justify-center gap-2">
              <Button
                className="bg-foreground font-medium text-background"
                color="secondary"
                endContent={<Icon icon="solar:download-linear" fontSize={20} />}
                variant="flat"
                as={Link}
                href={invoice?.invoice_pdf || "#"}
                target="_blank"
              >
                Download Invoice
              </Button>
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
      <div className="flex items-center justify-center w-full mb-5">
        <Alert 
          title="Next Billing"
          color="success"
          description={`Your next billing of ${lastInvoice?.amount_paid / 100 || 0}
           will be on ${lastInvoice?.lines?.data[0]?.period?.end 
          ? new Date(lastInvoice?.lines?.data[0]?.period?.end * 1000).toLocaleDateString() 
          : ""}`}
        className="w-full max-w-3xl"
        />
      </div>
      <Table aria-label="Invoices table">
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
        <TableBody items={currentInvoices}>
          {(item: Stripe.Invoice) => (
            <TableRow key={item?.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey) as React.ReactNode}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center items-center mt-10">
          <Pagination
              isCompact showControls showShadow initialPage={1} 
              total={totalPages} page={currentPage}
              onChange={handlePageChange}
            />
      </div>
    </div>
  );
}

export default ListInvoices