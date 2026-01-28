import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../ui/dialog";
import { Button } from "../../../ui/button";

interface InheritanceModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const InheritanceModal: React.FC<InheritanceModalProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
            <div className="text-right mt-2 mb-4 mt-4">
                <DialogTitle>להחיל הרשאות גם על כל הצאצאים של הקטגוריה הנבחרת?</DialogTitle>
            </div>
        </DialogHeader>
       <div className="text-right mt-2 mb-4">
        כל ההרשאות יעברו לתתי הקטגוריות והמוצרים שבצאצאים.
       <p>
       </p>
        <p className="text-sm text-gray-500 mt-2">
            כברירת מחדל כל ההרשאות שהוסרו גם יוסרו עבור כל הצאצאים.
        </p>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>לא</Button>
          <Button className="bg-green-600 text-white hover:bg-green-700" onClick={onConfirm}>כן</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InheritanceModal;
