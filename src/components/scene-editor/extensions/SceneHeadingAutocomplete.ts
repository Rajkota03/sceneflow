import { Extension } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import { SuggestionOptions } from '@tiptap/suggestion';
import tippy from 'tippy.js';

const SceneHeadingAutocomplete = Extension.create({
  name: 'sceneHeadingAutocomplete',

  addProseMirrorPlugins() {
    return [
      // Suggestion({
      //   editor: this.editor,
      //   char: '',
      //   startOfLine: true,
      //   allowSpaces: true,
      //   render: () => {
      //     let component: ReactRenderer;
      //     let popup: any;

      //     return {
      //       onStart: (props) => {
      //         component = new ReactRenderer(SceneHeadingSuggestionList, {
      //           props,
      //           editor: props.editor,
      //         });

      //         popup = tippy('body', {
      //           getReferenceClientRect: props.clientRect,
      //           appendTo: () => document.body,
      //           content: component.element,
      //           showOnCreate: true,
      //           interactive: true,
      //           trigger: 'manual',
      //           placement: 'bottom-start',
      //         });
      //       },
      //       onUpdate(props) {
      //         component.updateProps(props);
      //         popup[0].setProps({
      //           getReferenceClientRect: props.clientRect,
      //         });
      //       },
      //       onKeyDown(props) {
      //         if (props.event.key === 'Escape') {
      //           popup[0].hide();
      //           return true;
      //         }
      //         return component.ref?.onKeyDown(props);
      //       },
      //       onExit() {
      //         popup[0].destroy();
      //         component.destroy();
      //       },
      //     };
      //   },
      // }),
    ];
  },
});

export default SceneHeadingAutocomplete;