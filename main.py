from subprocess import Popen, DEVNULL
import aiohttp
from typing import TypedDict, Optional, Any
from textual.app import App, ComposeResult
from textual.containers import Horizontal, VerticalScroll
from textual.widgets import Button, Input, Static
from textual import events
from selectolax.parser import HTMLParser


class TorrentItem(TypedDict):
    title: str
    size: str
    date: str
    magnet: str


class FileAttributes(TypedDict):
    symlink: bool
    hidden: bool
    padding: bool
    executable: bool


class TorrentFile(TypedDict):
    name: str
    components: list[str]
    length: int
    included: bool
    attributes: FileAttributes


class TorrentDetails(TypedDict):
    id: int
    info_hash: str
    name: str
    output_folder: str
    files: list[TorrentFile]


class TorrentResponse(TypedDict):
    id: int
    details: TorrentDetails
    output_folder: str
    seen_peers: Optional[Any]


class WatchButton(Button):
    def __init__(self, magnet: str):
        super().__init__("PLAY", classes="watch-btn")
        self.magnet = magnet
        self.compact = False


class SearchBox(Horizontal):
    def compose(self) -> ComposeResult:
        yield Input(classes="input")
        yield Static("[bold]ANITRACK[/bold]", classes="logo")

    async def on_input_submitted(self):
        input = self.query_one(Input)
        await self.scrape_nyaa_subsplease(input.value)

    async def scrape_nyaa_subsplease(self, query: str):
        url = f"https://nyaa.si/user/subsplease?f=0&c=0_0&q={query}+1080p"
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                html = await response.text()
                tree = HTMLParser(html)
                results: list[TorrentItem] = []
                results_table = self.screen.query_one("#results", Results)
                for node in tree.css("tr.success"):
                    title_node = node.css_first("td:nth-child(2) a:not(.comments)")
                    magnet_node = node.css_first('a[href^="magnet"]')
                    size_node = node.css_first("td:nth-child(4)")
                    date_node = node.css_first("td[data-timestamp]")

                    if title_node and magnet_node and size_node and date_node:
                        title = title_node.text() or ""
                        magnet = magnet_node.attributes.get("href") or ""
                        size = size_node.text() or ""
                        date = date_node.text() or ""
                        results.append(
                            TorrentItem(
                                title=title, size=size, date=date, magnet=magnet
                            )
                        )

                        watch_btn = WatchButton(magnet)
                        results_table.add_result(watch_btn, title, size, date)


class Results(VerticalScroll, can_focus=True):
    def add_result(
        self, watch_btn: WatchButton, title: str, size: str, date: str
    ) -> None:
        title_widget = Static(f"[bold]{title}[/bold]", classes="result-item title-col")
        size_widget = Static(size, classes="result-item size-col")
        date_widget = Static(date, classes="result-item date-col")

        row = Horizontal(
            watch_btn, title_widget, size_widget, date_widget, classes="result-row"
        )
        self.mount(row)

    async def on_button_pressed(self, event: WatchButton.Pressed) -> None:
        if not isinstance(event.button, WatchButton):
            return

        url = "https://api.anitrack.frixaco.com/torrents"
        async with aiohttp.ClientSession() as session:
            async with session.post(url, data=event.button.magnet) as response:
                torrent_info: TorrentResponse = await response.json()
                stream_url = f"https://api.anitrack.frixaco.com/torrents/{torrent_info['details']['info_hash']}/stream/{len(torrent_info['details']['files']) - 1}"

                _ = Popen(["mpv", stream_url], stdout=DEVNULL, stderr=DEVNULL)


class AnitrackApp(App[str]):
    BINDINGS = [
        ("ctrl+q", "quit", "Quit"),
    ]

    CSS_PATH = "styles.tcss"

    def compose(self) -> ComposeResult:
        yield SearchBox(id="searchBox")
        yield Results(id="results")

    def on_mount(self) -> None:
        pass

    async def action_quit(self) -> None:
        self.exit("Anitrack quit.")

    def on_key(self, event: events.Key) -> None:
        pass


if __name__ == "__main__":
    app = AnitrackApp()
    exit_msg = app.run()
    print(exit_msg)
