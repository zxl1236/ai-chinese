import React, { useState, useCallback, useRef } from 'react';
import './BottomNavigation.css';

const BottomNavigation = ({ activeSection, onSectionChange, userType, theme = 'default' }) => {
  const [pressedItem, setPressedItem] = useState(null);
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 });
  const longPressTimer = useRef(null);
  
  const navItems = [
    { id: 'home', icon: '🏠', text: '首页', longPressAction: () => console.log('长按首页') },
    { id: 'study', icon: '📚', text: '学习', longPressAction: () => console.log('长按学习') },
    { id: 'courses', icon: '📅', text: '课程', longPressAction: () => console.log('长按课程') },
    { id: 'tutor', icon: '👨‍🏫', text: '陪练', longPressAction: () => console.log('长按陪练') },
    { id: 'profile', icon: '👤', text: '我的', longPressAction: () => console.log('长按我的') }
  ];

  // 处理触摸开始
  const handleTouchStart = useCallback((e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    setRipplePosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
    setPressedItem(item.id);
    
    // 触觉反馈（如果支持）
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // 设置长按定时器
    longPressTimer.current = setTimeout(() => {
      item.longPressAction();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, []);

  // 处理触摸结束
  const handleTouchEnd = useCallback((item) => {
    setPressedItem(null);
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // 处理点击
  const handleClick = useCallback((item) => {
    onSectionChange(item.id);
    // 轻微触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(5);
    }
  }, [onSectionChange]);

  return (
    <nav className="bottom-nav" data-theme={theme}>
      {navItems.map(item => (
        <button
          key={item.id}
          className={`nav-item ${activeSection === item.id ? 'active' : ''} ${pressedItem === item.id ? 'pressed' : ''}`}
          onClick={() => handleClick(item)}
          onTouchStart={(e) => handleTouchStart(e, item)}
          onTouchEnd={() => handleTouchEnd(item)}
          onTouchCancel={() => handleTouchEnd(item)}
          style={{
            '--ripple-x': `${ripplePosition.x}px`,
            '--ripple-y': `${ripplePosition.y}px`
          }}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.text}</span>
          {pressedItem === item.id && (
            <div 
              className="nav-ripple" 
              style={{
                left: ripplePosition.x,
                top: ripplePosition.y
              }}
            />
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNavigation;
