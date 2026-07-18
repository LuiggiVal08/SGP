import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable, NotFoundException } from '@nestjs/common';

export interface LoopState {
  storyId: string;
  status: string;
  testsPassedBefore: number;
  testsPassedAfter: number;
  lastCommit: string | null;
  halted: boolean;
  haltReason: string | null;
}

export interface LoopReceipt {
  story: string;
  date: string;
  haltReason: string;
  testsBefore: string;
  testsAfter: string;
  cost: string;
  commit: string;
  checker: string;
  escalado: string;
}

export interface LoopStory {
  id: string;
  title: string;
  epic: string;
  status: string;
  hardRule: boolean;
}

export interface LoopSnapshot {
  backlog: LoopStory[];
  state: LoopState | null;
  receipts: LoopReceipt[];
  generatedAt: string;
}

@Injectable()
export class LoopService {
  private readonly root =
    process.env.LOOP_ROOT ?? join(process.cwd(), '..', '..');
  private readonly loopMd = join(this.root, 'LOOP.md');
  private readonly stateJson = join(this.root, '.loop_state.json');

  getSnapshot(): LoopSnapshot {
    const md = this.readMarkdown();
    return {
      backlog: this.parseBacklog(md),
      state: this.parseState(),
      receipts: this.parseReceipts(md),
      generatedAt: new Date().toISOString(),
    };
  }

  getState(): LoopState | null {
    return this.parseState();
  }

  getReceipts(): LoopReceipt[] {
    return this.parseReceipts(this.readMarkdown());
  }

  private readMarkdown(): string {
    if (!existsSync(this.loopMd)) {
      throw new NotFoundException('LOOP.md no encontrado');
    }
    return readFileSync(this.loopMd, 'utf-8');
  }

  private parseBacklog(md: string): LoopStory[] {
    const stories: LoopStory[] = [];
    const epicRe = /^### Épica ([A-J])[ —-]+([^\n]+)/;
    const storyRe = /^- \[([ x])\] \*\*([A-J]\d)\*\* (.+?)( ⚠️.*)?$/;
    let currentEpic = '';
    for (const line of md.split('\n')) {
      const e = epicRe.exec(line);
      if (e) currentEpic = `${e[1]} — ${e[2].trim()}`;
      const s = storyRe.exec(line);
      if (s) {
        stories.push({
          id: s[2],
          title: s[3].trim(),
          epic: currentEpic,
          status: s[1] === 'x' ? 'HECHO' : 'PENDIENTE',
          hardRule: Boolean(s[4]),
        });
      }
    }
    return stories;
  }

  private parseState(): LoopState | null {
    if (!existsSync(this.stateJson)) return null;
    try {
      return JSON.parse(readFileSync(this.stateJson, 'utf-8')) as LoopState;
    } catch {
      return null;
    }
  }

  private parseReceipts(md: string): LoopReceipt[] {
    const receipts: LoopReceipt[] = [];
    const blockRe = /### loop\/([A-Z]\d)[^\n]*\n([\s\S]*?)(?=\n### |\n## |$)/g;
    let m: RegExpExecArray | null;
    while ((m = blockRe.exec(md))) {
      const body = m[2];
      const get = (key: string) =>
        body.match(new RegExp(`^- ${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? '';
      receipts.push({
        story: m[1],
        date: get('fecha') || get('date'),
        haltReason: get('halt_reason'),
        testsBefore: get('tests_before'),
        testsAfter: get('tests_after'),
        cost: get('cost'),
        commit: get('commit'),
        checker: get('checker'),
        escalado: get('escalado'),
      });
    }
    return receipts;
  }
}
