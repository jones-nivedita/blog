import React, {useState, useRef, useImperativeHandle, forwardRef } from 'react'

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const Editor = forwardRef(({ value, onChange }, ref) => {
  const quillRef = useRef();

  useImperativeHandle(ref, () => ({
    getEditor: () => {
      if (quillRef.current) {
        return quillRef.current.getEditor();
      }
      return null;
    },
  }));


    const modules = {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          ['link', 'image'],
          ['clean'],
        ],
      };

  return (
    <div className="content">
      <ReactQuill
        ref={quillRef}
        value={value}
        theme="snow"
        onChange={onChange}
        modules={modules} />
    </div>
  )
});

export default Editor;
