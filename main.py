from typing import TypedDict
from textual.app import App, ComposeResult
from textual.widgets import DataTable, Input
from textual import events
from selectolax.parser import HTMLParser


class TorrentItem(TypedDict):
    title: str
    size: str
    date: str
    magnet: str


class SearchBox(Input):
    async def action_submit(self):
        await self.scrape_nyaa_subsplease(self.value)

    async def scrape_nyaa_subsplease(self, query: str):
        import aiohttp

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

                        results_table.add_row(title, size, date)


class Results(DataTable[str]):
    def on_mount(self) -> None:
        self.add_columns("Title", "Size", "Date")


class AnitrackApp(App[str]):
    BINDINGS = [
        ("ctrl+q", "quit", "Quit"),
    ]

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
