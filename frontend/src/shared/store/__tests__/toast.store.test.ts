import { useToastStore } from '@/shared/store/toast.store';

describe('toast.store', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start empty', () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('should add a toast with default type info', () => {
    useToastStore.getState().addToast('Hello');
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Hello');
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].id).toBeDefined();
  });

  it('should add a toast with custom type', () => {
    useToastStore.getState().addToast('Error!', 'error');
    expect(useToastStore.getState().toasts[0].type).toBe('error');
  });

  it('should remove toast after 4 seconds', () => {
    useToastStore.getState().addToast('Auto dismiss');
    expect(useToastStore.getState().toasts).toHaveLength(1);

    vi.advanceTimersByTime(4000);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('should remove toast manually', () => {
    useToastStore.getState().addToast('Manual dismiss');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
