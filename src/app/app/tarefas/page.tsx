"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Clock3, Trash2 } from "lucide-react";

import { Panel } from "@/components/ui/Panel";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useResource } from "@/lib/hooks/useResource";
import { formatDate } from "@/lib/utils";
import {
  TASK_PRIORITY,
  TASK_STATUS,
  type Property,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/types";

const priorityLabel: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const statusLabel: Record<TaskStatus, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  done: "Concluída",
  late: "Atrasada",
};

function toIso(value: string): string {
  return new Date(value).toISOString();
}

export default function TasksPage() {
  const tasks = useResource<Task>("/api/tasks");
  const properties = useResource<Property>("/api/properties");

  const [form, setForm] = useState({
    name: "",
    property_id: "",
    due_date: "",
    priority: "medium" as TaskPriority,
    status: "pending" as TaskStatus,
  });

  const alerts = useMemo(() => {
    const now = Date.now();
    const twoDaysAhead = now + 2 * 24 * 60 * 60 * 1000;

    const overdue = tasks.data.filter((task) => {
      const due = new Date(task.due_date).getTime();
      return due < now && task.status !== "done";
    });

    const upcoming = tasks.data.filter((task) => {
      const due = new Date(task.due_date).getTime();
      return due >= now && due <= twoDaysAhead && task.status !== "done";
    });

    return { overdue, upcoming };
  }, [tasks.data]);

  async function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await tasks.create({
      name: form.name,
      property_id: form.property_id || null,
      due_date: toIso(form.due_date),
      priority: form.priority,
      status: form.status,
    });

    setForm({
      name: "",
      property_id: "",
      due_date: "",
      priority: "medium",
      status: "pending",
    });
  }

  function toneForStatus(status: TaskStatus): "default" | "success" | "warning" | "danger" {
    if (status === "done") return "success";
    if (status === "in_progress") return "warning";
    if (status === "late") return "danger";
    return "default";
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Tarefas e Prazos"
        description="Controle de diligências operacionais com alertas de atraso e prazo próximo."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Panel className="border-red-500/25 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-300">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">Atrasadas</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{alerts.overdue.length}</p>
        </Panel>
        <Panel className="border-amber-500/25 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-300">
            <Clock3 size={16} />
            <span className="text-sm font-medium">Prazo próximo (48h)</span>
          </div>
          <p className="mt-2 text-3xl font-semibold text-lv-text">{alerts.upcoming.length}</p>
        </Panel>
      </div>

      <Panel>
        <h3 className="mb-4 text-sm font-semibold text-lv-text">Nova tarefa</h3>
        <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={createTask}>
          <input
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Nome da tarefa"
            required
          />

          <select
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.property_id}
            onChange={(event) => setForm((prev) => ({ ...prev, property_id: event.target.value }))}
          >
            <option value="">Sem imóvel associado</option>
            {properties.data.map((property) => (
              <option key={property.id} value={property.id}>
                {property.address}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.due_date}
            onChange={(event) => setForm((prev) => ({ ...prev, due_date: event.target.value }))}
            required
          />

          <select
            className="rounded-xl border border-lv-border bg-lv-panelMuted px-3 py-2 text-sm"
            value={form.priority}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))
            }
          >
            {TASK_PRIORITY.map((priority) => (
              <option key={priority} value={priority}>
                Prioridade {priorityLabel[priority]}
              </option>
            ))}
          </select>

          <button className="rounded-xl border border-[#FFC107] bg-[#FFC107] px-4 py-2 text-sm font-medium text-[#000000]">
            Salvar tarefa
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionTitle title="Lista de tarefas" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lv-border text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.12em] text-lv-textMuted">
                <th className="px-2 py-3">Tarefa</th>
                <th className="px-2 py-3">Prioridade</th>
                <th className="px-2 py-3">Prazo</th>
                <th className="px-2 py-3">Status</th>
                <th className="px-2 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lv-border/60">
              {tasks.data.map((task) => (
                <tr key={task.id}>
                  <td className="px-2 py-3 text-lv-text">{task.name}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{priorityLabel[task.priority]}</td>
                  <td className="px-2 py-3 text-lv-textMuted">{formatDate(task.due_date)}</td>
                  <td className="px-2 py-3">
                    <select
                      value={task.status}
                      onChange={(event) =>
                        void tasks.update(task.id, { status: event.target.value as TaskStatus })
                      }
                      className="rounded-lg border border-lv-border bg-lv-panelMuted px-2 py-1 text-xs text-lv-text"
                    >
                      {TASK_STATUS.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge label={statusLabel[task.status]} tone={toneForStatus(task.status)} />
                      <button
                        type="button"
                        className="rounded-lg border border-red-500/35 bg-red-500/10 p-2 text-red-300"
                        onClick={() => void tasks.remove(task.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
