// @ts-nocheck
'use client';

import { useEffect } from 'react';
import AOS from 'aos';

export default function AOSInit() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false,
      offset: 100,
    });
  }, []);

  return null;
}
