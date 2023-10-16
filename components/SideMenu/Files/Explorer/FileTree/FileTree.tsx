import Tree, { TreeProps } from 'rc-tree';
import { DataNode, Key, TreeNodeProps } from 'rc-tree/lib/interface';
import { useEffect, useState } from 'react';
import { File as FileDto } from '@/lib/repository';
import { File } from '../File/File';
import * as S from './FileTree.atoms';
import './FileTree.css';
import { useMoveFile } from '../useMoveFile';
import * as Files from '@/lib/files';

type FileType =
  | (FileDto & { isNew?: boolean; newType: undefined })
  | {
      path: string;
      isNew: boolean;
      newType: 'file' | 'folder';
      type: undefined;
    };

const motion: TreeProps['motion'] = {
  motionName: 'node-motion',
  motionAppear: false,
  onAppearStart: () => {
    return { height: 0 };
  },
  onAppearActive: (node: HTMLElement) => ({ height: node.scrollHeight }),
  onLeaveStart: (node: HTMLElement) => ({ height: node.offsetHeight }),
  onLeaveActive: () => ({ height: 0 }),
};

const newEntry = (segment: string, file: FileType, level: number) => {
  const path = file.path;
  const isFile =
    file.type === 'file' && file.path.split('/').slice(1 + level).length === 1;
  const nodePath = Files.path(...path.split('/').slice(1, 2 + level));

  return {
    key: nodePath,
    title: () => (
      <File
        path={nodePath}
        isNew={file.isNew || false}
        newType={file.newType}
      />
    ),
    children: [] as DataNode[],
    isLeaf: file.newType === 'file' || isFile,
    path: nodePath,
    file,
  };
};

const addFile = (arr: DataNode[], file: FileType, level = 0): DataNode[] => {
  const path = file.path.split('/').slice(1);

  if (path.length === 0 && !file.isNew) return arr;
  if (path.length < level + 1) return arr;
  const segment =
    file.isNew && level === 0 ? '/' : Files.path(...path.slice(0, level + 1));

  const index = arr.findIndex((node) => node.key === segment);
  if (index === -1) {
    const entry = newEntry(segment, file, level);
    entry.children = addFile([], file, level + 1);
    return [...arr, entry];
  }

  const data = arr[index]?.children as DataNode[];
  const newArr = {
    ...arr[index],
    children: addFile(data, file, level + 1),
  };
  arr.splice(index, 1, newArr);
  return arr;
};

const filesToNodes = (files: FileType[]): DataNode[] => {
  return files.reduce((data, file) => addFile(data, file), [] as DataNode[]);
};

const Icon = ({ expanded, isLeaf }: TreeNodeProps) => {
  if (isLeaf) return <S.Image $src={'/structogram.png'} />;
  if (!expanded) return <S.Image $src={'/folder-line.png'} />;
  return <S.Image $src={'/folder-5-line.png'} />;
};

const Switcher = ({ expanded, isLeaf }: TreeNodeProps) => {
  if (isLeaf) return <div style={{ width: '16px', height: '16px' }}></div>;
  if (!expanded) return <S.Image $src={'/arrow-right-s-line.png'} />;
  return <S.Image $src={'/arrow-down-s-line.png'} />;
};

function DropIndicator({
  dropPosition,
  dropLevelOffset,
  indent,
}: {
  dropPosition: -1 | 0 | 1;
  dropLevelOffset: number;
  indent: number;
}) {
  const style: React.CSSProperties = {
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    backgroundColor: 'var(--blue)',
    height: 2,
  };
  switch (dropPosition) {
    case -1:
      style.top = 0;
      style.left = -dropLevelOffset * indent;
      break;
    case 1:
      style.bottom = 0;
      style.left = -dropLevelOffset * indent;
      break;
    case 0:
      style.bottom = 0;
      style.left = indent;
      break;
  }
  return <div style={style} />;
}

interface FileTreeProps {
  files: FileType[];
  recent?: FileType;
}

export const FileTree = ({ files: data, recent }: FileTreeProps) => {
  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(false);
  const moveFile = useMoveFile();

  const files: DataNode[] = filesToNodes(data);

  useEffect(() => {
    if (!recent) return;
    const path = recent.path.split('/').slice(1);
    const keys = path.map((_, i) => Files.path(...path.slice(0, i + 1)));
    setExpandedKeys(keys);
  }, [recent]);

  const onDragEnter: TreeProps['onDragEnter'] = ({ expandedKeys }) => {
    setExpandedKeys(expandedKeys);
  };

  const onDrop: TreeProps['onDrop'] = (info: any) => {
    const from = info.dragNode.path;
    const to =
      info.node.file.type === 'file'
        ? info.node.file.path.split('/').slice(0, -1).join('/')
        : info.node.path;

    if (from === to) return;
    setExpandedKeys((keys) => [...keys, to.split('/').pop()]);
    moveFile.mutate({
      to,
      from,
    });
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (
      data: any[],
      key: any,
      callback: (item: any, index: number, arr: any[]) => void,
    ) => {
      data.forEach((item, index, arr) => {
        if (item.key === key) {
          callback(item, index, arr);
          return;
        }
        if (item.children) {
          loop(item.children, key, callback);
        }
      });
    };
    const data = [...files];

    // Find dragObject
    let dragObj: any;
    loop(data, dragKey, (item: any, index: number, arr: any[]) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item: any) => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.push(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item: any) => {
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.unshift(dragObj);
      });
    } else {
      // Drop on the gap
      let ar: any;
      let i: number & any;
      loop(data, dropKey, (item: any, index: number, arr: any[]) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }
  };

  const onExpand: TreeProps['onExpand'] = (expandedKeys, info) => {
    const isEmptyFolder = info.node?.children?.length === 0;
    if (isEmptyFolder) return;
    setExpandedKeys(expandedKeys);
    setAutoExpandParent(false);
  };

  return (
    <Tree
      expandedKeys={expandedKeys}
      onExpand={onExpand}
      autoExpandParent={autoExpandParent}
      draggable
      selectable={false}
      onDragEnter={onDragEnter}
      onDrop={onDrop}
      treeData={files}
      motion={motion}
      showIcon={true}
      icon={Icon}
      dropIndicatorRender={DropIndicator}
      switcherIcon={Switcher}
    />
  );
};
