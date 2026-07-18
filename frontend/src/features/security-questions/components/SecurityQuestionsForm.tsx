import { Button, Input, Select, ListBox, Skeleton } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, Save, X, Pencil } from 'lucide-react';
import { useState } from 'react';
import { securityQuestionsSchema, type SecurityQuestionsFormValues } from '../schemas/security-questions.schema';
import { useAvailableQuestions, useMyQuestions, useSetMyQuestions } from '../hooks/useSecurityQuestions';
import { sileo } from 'sileo';
import { ShieldCheck } from 'lucide-react';
import { FieldLabel } from '@/shared/components/FieldLabel';

export function SecurityQuestionsForm() {
  const { data: availableQuestions, isLoading: loadingQuestions } = useAvailableQuestions();
  const { data: myQuestions, isLoading: loadingMine, refetch: refetchMine } = useMyQuestions();
  const setMutation = useSetMyQuestions();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    reset,
    setValue,
  } = useForm<SecurityQuestionsFormValues>({
    resolver: zodResolver(securityQuestionsSchema),
    defaultValues: {
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
      question3: '',
      answer3: '',
    },
  });

  const hasQuestions = myQuestions && myQuestions.length > 0;

  const startEditing = () => {
    if (myQuestions && myQuestions.length >= 3) {
      setValue('question1', myQuestions[0].questionId);
      setValue('question2', myQuestions[1].questionId);
      setValue('question3', myQuestions[2].questionId);
    }
    setEditing(true);
  };

  const onSubmit = async (data: SecurityQuestionsFormValues) => {
    try {
      await setMutation.mutateAsync({
        questions: [
          { questionId: data.question1, answer: data.answer1 },
          { questionId: data.question2, answer: data.answer2 },
          { questionId: data.question3, answer: data.answer3 },
        ],
      });
      sileo.success({ title: 'Preguntas de seguridad guardadas exitosamente', description: 'Se usarán para recuperar su contraseña.' });
      await refetchMine();
      setEditing(false);
      reset();
    } catch {
      sileo.error({ title: 'Error al guardar las preguntas de seguridad', description: 'Intente nuevamente más tarde.' });
    }
  };

  const onCancel = () => {
    reset({
      question1: '',
      answer1: '',
      question2: '',
      answer2: '',
      question3: '',
      answer3: '',
    });
    setEditing(false);
  };

  if (loadingQuestions || loadingMine) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!editing && hasQuestions) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-success">
          <ShieldCheck size={16} />
          <span>Tienes 3 preguntas de seguridad configuradas</span>
        </div>
        <Button variant="ghost" onPress={startEditing} size="sm">
          <Pencil size={14} />
          Cambiar preguntas
        </Button>
      </div>
    );
  }

  if (!editing && !hasQuestions) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-warning">
          <Shield size={16} />
          <span>No has configurado preguntas de seguridad</span>
        </div>
        <Button variant="ghost" onPress={startEditing} size="sm">
          <Shield size={14} />
          Configurar preguntas
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[1, 2, 3].map((num) => {
                const qKey = `question${num as 1 | 2 | 3}` as const;
                const selectedKeys = [watch('question1'), watch('question2'), watch('question3')];
                const filteredQuestions = availableQuestions?.filter(
                  (q) => q.id === selectedKeys[num - 1] || !selectedKeys.includes(q.id),
                );

                return (
                  <div key={num} className="space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel label={`Pregunta ${num}`} help="Elige una pregunta. Las 3 deben ser distintas" htmlFor={`question-${num}`} className="text-xs text-muted uppercase tracking-wider" />
                      <Select
                        aria-label={`Pregunta ${num}`}
                        selectedKey={watch(qKey) || null}
                        onSelectionChange={(key) => setValue(qKey, key as string, { shouldValidate: true })}
                        placeholder="Seleccione una pregunta"
                      >
                        <Select.Trigger className="w-full h-10 px-3 rounded-xl bg-surface-secondary/50 border border-border text-sm text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                          <ListBox>
                            {filteredQuestions?.map((q) => (
                              <ListBox.Item key={q.id} id={q.id} textValue={q.questionText} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                                {q.questionText}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                      {errors[qKey] && (
                        <p className="text-danger text-xs">
                          {errors[qKey]?.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel label={`Respuesta ${num}`} help="Respuesta que recordarás fácilmente. Mínimo 2 caracteres" htmlFor={`answer-${num}`} className="text-xs text-muted uppercase tracking-wider" />
                      <Input
                        id={`answer-${num}`}
                        type="text"
                        {...register(`answer${num as 1 | 2 | 3}` as const)}
                      />
                      {errors[`answer${num as 1 | 2 | 3}` as keyof typeof errors] && (
                        <p className="text-danger text-xs">
                          {errors[`answer${num as 1 | 2 | 3}` as keyof typeof errors]?.message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

      {setMutation.isError && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
          <p className="text-danger text-sm">Error al guardar. Intente nuevamente.</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="primary"
          type="submit"
          isDisabled={!isDirty || setMutation.isPending}
        >
          <Save size={14} />
          {setMutation.isPending ? 'Guardando…' : 'Guardar'}
        </Button>
        <Button variant="ghost" onPress={onCancel}>
          <X size={14} />
          Cancelar
        </Button>
      </div>
    </form>
  );
}
