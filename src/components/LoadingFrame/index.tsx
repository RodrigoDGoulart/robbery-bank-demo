import './LoadingFrame.scss';

interface Props {
  loading: number
}

const staticImagePath = "/static_images";

export default function LoadingFrame({loading}: Props) {
  const width = `${Math.max(0, Math.min(loading, 1)) * 44}%`;

  return (
    <div className="app-shell">
      <div className='app-loading'>
        <img
          className="loading-frame"
          src={`${staticImagePath}/loading-frame.png`}
        />      
        <img
          className="loading-bar"
          src={`${staticImagePath}/loading-bar.png`}
          style={{
            width
          }}
        />      
      </div>
    </div>
  );
}
