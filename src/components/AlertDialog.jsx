import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function CustomAlertDialog({ open, onClose, onPressed, title, content,buttonTitle,isLoading }) {
  const handleClose = async () => {
    await onPressed?.();
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          {
            isLoading ? <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"/> 
            : buttonTitle
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomAlertDialog;
