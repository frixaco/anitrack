//go:build windows

package main

import (
	"log"
	"os/exec"
	"syscall"
)

func LaunchMpv(magnetUrl string) {
	cmd := exec.Command("mpv", magnetUrl)

	cmd.SysProcAttr = &syscall.SysProcAttr{
		CreationFlags: syscall.CREATE_NEW_PROCESS_GROUP | 0x00000008,
	}

	err := cmd.Start()
	if err != nil {
		log.Printf("Error starting mpv: %v\n", err)
	}
}
