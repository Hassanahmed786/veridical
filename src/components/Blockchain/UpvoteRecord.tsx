import { useMonad } from '../../hooks/useMonad';

const UpvoteRecord = ({ eventId }: { eventId: string }) => {
  const { upvoteRecord, isConnected, isCorrectChain } = useMonad();

  const handleUpvote = async () => {
    if (isConnected && isCorrectChain) {
      await upvoteRecord(eventId);
    }
  };

  return (
    <button
      onClick={handleUpvote}
      disabled={!isConnected || !isCorrectChain}
      className="px-4 py-2 bg-monad-purple text-text-primary rounded hover:bg-monad-dim disabled:opacity-50"
    >
      Upvote
    </button>
  );
};

export default UpvoteRecord;