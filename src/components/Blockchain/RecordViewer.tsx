import { useEffect, useState } from 'react';
import { useMonad } from '../../hooks/useMonad';

const RecordViewer = () => {
  const { getRecord } = useMonad();
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    const fetchRecord = async () => {
      const data = await getRecord('example-id');
      setRecord(data);
    };
    fetchRecord();
  }, [getRecord]);

  return null; // Component for viewing records
};

export default RecordViewer;