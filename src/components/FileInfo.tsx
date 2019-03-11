import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Page from './Page';
import * as API from '../api/base';
import Dictionary from '../app/Dictionary';
import './FileInfo.scss';

interface Props {
  file: API.File | File | URL | null;
  dictionary: Dictionary;
  onClose: () => void;
}

export function FileInfo(props: Props) {
  const { file, dictionary } = props;
  const name
    = file instanceof API.File ? file.name
      : file instanceof File ? file.name
        : file instanceof URL ? file.pathname.split("/").pop()
          : "不明";
  const path
    = file instanceof API.File ? file.path
      : file instanceof File ? file.name
        : file instanceof URL ? file.href
          : "不明";
  let indent;
  if (dictionary.detectedIndent === null) {
    indent = "なし";
  } else if (dictionary.detectedIndent === "zpdic") {
    indent = "ZpDIC";
  } else if (/^ +$/.test(dictionary.detectedIndent)) {
    indent = `スペース ×${dictionary.detectedIndent.length}`;
  } else if (/^\t+$/.test(dictionary.detectedIndent)) {
    indent = `タブ ×${dictionary.detectedIndent.length}`;
  } else {
    indent = JSON.stringify(dictionary.detectedIndent);
  }
  return (
    <Page.List>
      <Page.Item>
        <Page.Header>
          <Page.Button onClick={props.onClose}><FontAwesomeIcon icon="times" /></Page.Button>
          <Page.Title>このファイルについて</Page.Title>
        </Page.Header>
        <Page.Body>
          <div className="file-info">
            <h5>名前</h5>
            <p>{name}</p>
            <h5>パス</h5>
            <p>{path}</p>
            <h5>整形形式（自動判別）</h5>
            <p>{indent}</p>
            <h5>中身</h5>
            <pre>{dictionary.preview()}</pre>
          </div>
        </Page.Body>
      </Page.Item>
    </Page.List>
  );
}
