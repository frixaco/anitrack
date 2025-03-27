//go:build !windows

package main

import (
	"log"
	"os/exec"
	"syscall"
)

func LaunchMpv(magnetUrl string) {
	cmd := exec.Command("mpv", magnetUrl)

	cmd.SysProcAttr = &syscall.SysProcAttr{
		Setpgid: true,
		Pgid:    0,
	}

	err := cmd.Start()
	if err != nil {
		log.Printf("Error starting mpv: %v\n", err)
	}
}
