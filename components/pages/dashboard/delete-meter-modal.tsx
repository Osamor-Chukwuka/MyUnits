import { FC } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteMeterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  meterName?: string;
  loading?: boolean;
}

const DeleteMeterModal: FC<DeleteMeterModalProps> = ({ isOpen, onClose, onConfirm, meterName, loading }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Meter</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <span className="font-semibold">{meterName || 'this meter'}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="border-2 border-white border-t-transparent rounded-full w-4 h-4 animate-spin"></span>
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteMeterModal;
