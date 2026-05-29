import { useSidebarStore } from '@/shared/store/sidebar.store';

describe('sidebar.store', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isOpen: false });
  });

  it('should start closed', () => {
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it('should toggle open/close', () => {
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().isOpen).toBe(true);

    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it('should open', () => {
    useSidebarStore.getState().open();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it('should close', () => {
    useSidebarStore.getState().open();
    useSidebarStore.getState().close();
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });
});
