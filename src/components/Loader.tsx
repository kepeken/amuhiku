import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Loader.scss';

interface Props {
  show: boolean;
}

export default function Loader(props: Props) {
  return (
    <>
      {props.show && (
        <div className="loader">
          <FontAwesomeIcon icon="spinner" pulse />
        </div>
      )}
    </>
  );
}
