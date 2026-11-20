import { useRef } from 'react';
export default function TrailerButton({ movie, onOpenChange }) {
 const dialog=useRef(null);
 return movie.trailerUrl ? <><button className="trailer-button" onClick={()=>{dialog.current.showModal();onOpenChange?.(true);}}>Xem trailer</button><dialog ref={dialog} className="trailer-dialog" onClose={()=>{onOpenChange?.(false);const frame=dialog.current.querySelector('iframe');if(frame)frame.src=movie.trailerUrl;}}><form method="dialog"><strong>{movie.title}</strong><button aria-label="Đóng trailer">Đóng ×</button></form><iframe title={`Trailer ${movie.title}`} src={movie.trailerUrl} allowFullScreen allow="encrypted-media; fullscreen"/></dialog></> : null;
}
