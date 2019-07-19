import React, { useState, useEffect } from 'react';
import firebase from '../../plugins/firebase';


interface Props {
  match: { params: { id: string; }; };
}

const WordList = ({ match }: Props) => {
  const [dictionaryData, setDictionaryData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const readDictionary = firebase.functions().httpsCallable("readDictionary");
        const { data } = await readDictionary({ id: match.params.id });
        setDictionaryData(data);
      } catch (error) {
        alert(error);
      }
    })();
  }, []);

  return (
    <div>
      {JSON.stringify(dictionaryData)}
    </div>
  );
};

export default WordList;
