"use client";
import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import { dismissCurrent } from '@/lib/store/notificationsSlice';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simple fade/slide styles can be improved later
export const NotificationToaster: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { queue, currentId } = useSelector((s: RootState) => s.notifications);
  const current = queue.find(n => n.id === currentId);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const remainingMs = current.durationMs;
    timeoutRef.current = setTimeout(() => {
      dispatch(dismissCurrent());
    }, remainingMs);
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [current, dispatch]);

  if (!current) return null;
  const positionStyles = 'fixed top-4 right-4 z-50 w-80';
  const pendingCount = queue.length - 1; // excluding current

  return (
    <div className={positionStyles} role="status" aria-live="polite">
      <Alert className="shadow-lg border grid-cols-1" variant={current.type === 'error' ? 'destructive' : undefined}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 space-y-1">
            <AlertTitle className="text-sm font-semibold">
              {current.type === 'success' ? 'Success' : current.type === 'error' ? 'Error' : 'Notice'}
            </AlertTitle>
            <AlertDescription className="text-sm">{current.message}</AlertDescription>
            {pendingCount > 0 && (
              <div className="text-[11px] text-muted-foreground">{pendingCount} more notification{pendingCount > 1 ? 's' : ''} queued</div>
            )}
          </div>
          <Button variant="ghost" size="icon" aria-label="Dismiss" onClick={() => dispatch(dismissCurrent())}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Alert>
    </div>
  );
};

