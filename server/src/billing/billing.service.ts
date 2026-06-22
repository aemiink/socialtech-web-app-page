import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { BillingStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service";
import { CreateInvoiceDto } from "./dto/create-invoice.dto";
import { UpdateInvoiceDto } from "./dto/update-invoice.dto";

const INVOICE_SELECT = {
  id: true,
  invoiceNumber: true,
  packageType: true,
  description: true,
  amount: true,
  currency: true,
  periodStart: true,
  periodEnd: true,
  dueDate: true,
  status: true,
  paidAt: true,
  note: true,
  createdAt: true,
  updatedAt: true,
  createdByUser: {
    select: { id: true, displayName: true, email: true },
  },
} satisfies Prisma.ClientInvoiceSelect;

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async listInvoices(clientProfileId: string) {
    await this.assertClientExists(clientProfileId);

    return this.prisma.clientInvoice.findMany({
      where: { clientProfileId },
      select: INVOICE_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  async createInvoice(clientProfileId: string, createdByUserId: string, dto: CreateInvoiceDto) {
    await this.assertClientExists(clientProfileId);

    const invoiceNumber = await this.generateInvoiceNumber();

    return this.prisma.clientInvoice.create({
      data: {
        clientProfileId,
        createdByUserId,
        invoiceNumber,
        packageType: dto.packageType,
        description: dto.description,
        amount: new Prisma.Decimal(dto.amount),
        currency: "TRY",
        periodStart: dto.periodStart ? new Date(dto.periodStart) : null,
        periodEnd: dto.periodEnd ? new Date(dto.periodEnd) : null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: dto.status ?? BillingStatus.PENDING,
        note: dto.note ?? null,
      },
      select: INVOICE_SELECT,
    });
  }

  async updateInvoice(clientProfileId: string, invoiceId: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.clientInvoice.findFirst({
      where: { id: invoiceId, clientProfileId },
    });

    if (!invoice) {
      throw new NotFoundException("Fatura bulunamadı.");
    }

    const data: Prisma.ClientInvoiceUpdateInput = {};

    if (dto.status !== undefined) {
      data.status = dto.status;

      if (dto.status === BillingStatus.PAID && !invoice.paidAt && !dto.paidAt) {
        data.paidAt = new Date();
      }

      if (dto.status !== BillingStatus.PAID) {
        data.paidAt = null;
      }
    }

    if (dto.paidAt !== undefined) {
      data.paidAt = new Date(dto.paidAt);
    }

    if (dto.amount !== undefined) {
      data.amount = new Prisma.Decimal(dto.amount);
    }

    if (dto.description !== undefined) data.description = dto.description;
    if (dto.periodStart !== undefined) data.periodStart = dto.periodStart ? new Date(dto.periodStart) : null;
    if (dto.periodEnd !== undefined) data.periodEnd = dto.periodEnd ? new Date(dto.periodEnd) : null;
    if (dto.dueDate !== undefined) data.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.note !== undefined) data.note = dto.note;

    return this.prisma.clientInvoice.update({
      where: { id: invoiceId },
      data,
      select: INVOICE_SELECT,
    });
  }

  async deleteInvoice(clientProfileId: string, invoiceId: string) {
    const invoice = await this.prisma.clientInvoice.findFirst({
      where: { id: invoiceId, clientProfileId },
    });

    if (!invoice) {
      throw new NotFoundException("Fatura bulunamadı.");
    }

    if (invoice.status === BillingStatus.PAID) {
      throw new BadRequestException("Ödenmiş faturalar silinemez.");
    }

    await this.prisma.clientInvoice.delete({ where: { id: invoiceId } });

    return { success: true };
  }

  private async assertClientExists(clientProfileId: string) {
    const client = await this.prisma.clientProfile.findFirst({
      where: { id: clientProfileId, deletedAt: null },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException("Müşteri bulunamadı.");
    }
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ST-${year}-`;

    const last = await this.prisma.clientInvoice.findFirst({
      where: { invoiceNumber: { startsWith: prefix } },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    });

    const lastSeq = last ? parseInt(last.invoiceNumber.replace(prefix, ""), 10) : 0;
    const nextSeq = (isNaN(lastSeq) ? 0 : lastSeq) + 1;

    return `${prefix}${String(nextSeq).padStart(4, "0")}`;
  }
}
