/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

export interface CartaPdfData {
  authorName: string;
  projectTitle: string;
  tutorName: string;
  pnfName: string;
  year: number;
  defensaDate: Date | null;
}

@Injectable()
export class CartaPdfService {
  private readonly logger = new Logger(CartaPdfService.name);

  generate(data: CartaPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'LETTER',
          margins: { top: 60, bottom: 60, left: 70, right: 70 },
          info: {
            Title: `Carta de Culminación - ${data.authorName}`,
            Author: 'SGP',
          },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const { width } = doc.page;
        const centerX = width / 2;

        this.addHeader(doc, centerX, data);
        doc.moveDown(1.5);
        this.addTitle(doc, centerX);
        doc.moveDown(2);
        this.addBody(doc, data);
        doc.moveDown(3);
        this.addSignature(doc, centerX);

        doc.end();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  private addHeader(
    doc: PDFKit.PDFDocument,
    centerX: number,
    data: CartaPdfData,
  ) {
    doc
      .fontSize(11)
      .font('Helvetica')
      .text('REPÚBLICA BOLIVARIANA DE VENEZUELA', centerX, 60, {
        align: 'center',
      })
      .fontSize(10)
      .text('MINISTERIO DEL PODER POPULAR PARA LA EDUCACIÓN UNIVERSITARIA', {
        align: 'center',
      })
      .moveDown(0.3);

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(data.pnfName.toUpperCase(), { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(10)
      .font('Helvetica')
      .text(`Año: ${data.year}`, { align: 'center' });
  }

  private addTitle(doc: PDFKit.PDFDocument, _centerX: number) {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('CARTA DE CULMINACIÓN', { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(10)
      .font('Helvetica')
      .text('Por medio de la presente se hace constar que:', {
        align: 'center',
      });
  }

  private addBody(doc: PDFKit.PDFDocument, data: CartaPdfData) {
    doc.moveDown(1);

    const defensaDateStr = data.defensaDate
      ? new Date(data.defensaDate).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : `______ de ______ de ${data.year}`;

    const bodyLines = [
      {
        text: data.authorName,
        opts: {
          fontSize: 13,
          font: 'Helvetica-Bold',
          align: 'center' as const,
        },
      },
      {
        text: '',
        opts: { fontSize: 10, font: 'Helvetica', align: 'center' as const },
      },
      {
        text: 'ha culminado satisfactoriamente el Trabajo Especial de Grado titulado:',
        opts: { fontSize: 11, font: 'Helvetica', align: 'center' as const },
      },
      {
        text: `"${data.projectTitle}"`,
        opts: {
          fontSize: 12,
          font: 'Helvetica-Bold',
          align: 'center' as const,
        },
      },
      {
        text: '',
        opts: { fontSize: 10, font: 'Helvetica', align: 'center' as const },
      },
      {
        text: `como requisito parcial para optar al título en ${data.pnfName}.`,
        opts: { fontSize: 11, font: 'Helvetica', align: 'center' as const },
      },
    ];

    for (const line of bodyLines) {
      if (line.text === '') {
        doc.moveDown(0.5);
        continue;
      }
      doc
        .fontSize(line.opts.fontSize)
        .font(line.opts.font)
        .text(line.text, { align: line.opts.align });
    }

    doc.moveDown(1.5);

    doc
      .fontSize(11)
      .font('Helvetica')
      .text('Tutor(es) Académico(s):', { align: 'left' });
    doc
      .moveDown(0.3)
      .fontSize(11)
      .font('Helvetica')
      .text(`- ${data.tutorName}`, { indent: 20 });

    doc.moveDown(2);

    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`Fecha de culminación: ${defensaDateStr}`, { align: 'left' });
  }

  private addSignature(doc: PDFKit.PDFDocument, centerX: number) {
    doc.moveDown(4);

    const lineWidth = 200;
    const startX = centerX - lineWidth / 2;
    const lineY = doc.y;

    doc
      .moveTo(startX, lineY)
      .lineTo(startX + lineWidth, lineY)
      .stroke();

    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Coordinador(a) del PNF', { align: 'center' });
  }
}
